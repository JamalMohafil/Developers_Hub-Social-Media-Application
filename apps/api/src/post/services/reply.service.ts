import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { UserRepository } from 'src/user/user.repository';

import { PostRepository } from '../post.repository';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationData } from 'src/notification/types/notification.interface';
import { CACHE_TTL } from 'src/constants';
import { RedisService } from 'src/redis/services/redis.service';

@Injectable()
export class ReplyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,

    private readonly postRepository: PostRepository,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
  ) {}
  async likeReply(replyId: string, user: any) {
    // التحقق من وجود التعليق أولا للفشل السريع قبل بدء المعاملة
    const replyCheck = await this.prisma.reply.findUnique({
      where: { id: replyId },
      include: { comment: { select: { postId: true } } },
    });

    if (!replyCheck) {
      throw new NotFoundException('Comment not found');
    }

    const postId = replyCheck.comment.postId;
    let action = 'liked';

    // استخدام updateMany مع upsert pattern بدلاً من البحث ثم الإنشاء/الحذف
    try {
      const existingLike = await this.prisma.like.findUnique({
        where: {
          replyId_userId: {
            replyId: replyId,
            userId: user.id,
          },
        },
      });

      if (existingLike) {
        // حذف الإعجاب إذا كان موجودًا
        await this.prisma.like.delete({
          where: {
            replyId_userId: {
              replyId: replyId,
              userId: user.id,
            },
          },
        });
        action = 'unliked';
      } else {
        // إنشاء إعجاب جديد
        await this.prisma.like.create({
          data: {
            replyId: replyId,
            userId: user.id,
          },
        });
        if (replyCheck.userId !== user.id) {
          const notificationReachedLimit =
            await this.checkLikeReplyNotificationLimit(user.id, postId);
          console.log(notificationReachedLimit, 'notificationReachedLimit');
          if (!notificationReachedLimit) {
            await this.handleReplyNotification(
              replyCheck.userId,
              user,
              postId,
              notificationReachedLimit,
              'liked',
            );
          }
        }
      }

      // تحديث الكاش مباشرة بعد التعديل
      if (postId) {
        // تشغيل إلغاء صلاحية الكاش بشكل متوازي للتحسين
        this.postRepository
          .invalidatePostCommentsCache(postId)
          .catch((error) =>
            console.error('Failed to invalidate cache:', error),
          );
      }

      return {
        status: HttpStatus.OK,
        message: `Reply ${action} Successfully`,
        action: action,
      };
    } catch (error) {
      // معالجة الأخطاء بشكل أفضل
      console.error('Error in likeComment:', error);
      throw new InternalServerErrorException(
        'Failed to process like operation',
      );
    }
  }
  async getCommentReplies(
    commentId: string,
    limit: number,
    page: number,
    accessToken: string,
  ) {
    let userId: string | null = null;
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('Comment Not Found');
    }
    if (accessToken) {
      userId = await this.userRepository.extractUserIdFromToken(accessToken);
    }
    const skip = (page - 1) * limit;

    const replies = await this.prisma.reply.findMany({
      where: {
        commentId: commentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
        user: { select: { name: true, image: true, id: true } },
        ...(userId ? { likes: { select: { userId: true } } } : {}),
      },
      skip: skip,
      take: limit,
    });

    return replies.map((reply) => {
      const { _count, likes, ...replyData } = reply;
      const isLiked = userId
        ? likes.some((like) => like.userId === userId)
        : false;
      return {
        likeCount: _count.likes,
        ...replyData,
        isLiked: isLiked,
      };
    });
  }
  async deleteReply(replyId: string, postId: string, user: any) {
    try {
      const replyExists = await this.prisma.reply.findUnique({
        where: { id: replyId },
        select: { id: true, userId: true },
      });
      if (!replyExists) {
        return new NotFoundException('Comment Not Found');
      }
      if (replyExists.userId !== user.id) {
        return new UnauthorizedException(
          'You are not allowed to perform this action',
        );
      }

      const deletedReply = await this.prisma.reply.delete({
        where: { id: replyId },
      });
      console.log(deletedReply, 'deletedReply');
      // تشغيل إلغاء صلاحية الكاش بشكل متوازي للتحسين
      await this.postRepository
        .invalidatePostCommentsCache(postId)
        .catch((error) => console.error('Failed to invalidate cache:', error));

      return new HttpException('Reply Deleted Successfully', HttpStatus.OK);
    } catch (e) {
      return new InternalServerErrorException(
        'Something Went Wrong' + e.message,
      );
    }
  }
  async updateReply(
    postId: string,
    replyId: string,
    content: string,
    user: any,
  ) {
    try {
      const commentExists = await this.prisma.reply.findUnique({
        where: { id: replyId },
        select: { id: true, userId: true },
      });
      if (!commentExists) {
        throw new NotFoundException('Comment Not Found');
      }
      console.log(user.id, commentExists.userId);
      if (commentExists.userId !== user.id) {
        throw new UnauthorizedException(
          'You are not allowed to perform this action',
        );
      }

      await this.prisma.reply.update({
        where: { id: replyId },
        data: { content: content },
      });
      await this.postRepository
        .invalidatePostCommentsCache(postId)
        .catch((error) => console.error('Failed to invalidate cache:', error));
      return new HttpException('Reply Updated Successfully', HttpStatus.OK);
    } catch (e) {
      throw new InternalServerErrorException(
        'Something Went Wrong' + e.message,
      );
    }
  }
  async addReply(
    commentId: string,
    postId: string,
    user: any,
    content: string,
  ) {
    if (!commentId) {
      throw new NotFoundException('Comment not found');
    }
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    const reply = await this.prisma.reply.create({
      data: {
        commentId: commentId,
        userId: user.id,
        content,
      },
      include: {
        user: { select: { name: true, image: true, id: true } },
      },
    });
    await this.postRepository
      .invalidatePostCommentsCache(postId)
      .catch((error) => console.error('Failed to invalidate cache:', error));
    if (comment.userId !== user.id) {
      const notificationReachedLimit = await this.checkReplyNotificationLimit(
        user.id,
        postId,
      );
      if (!notificationReachedLimit) {
        await this.handleReplyNotification(
          comment.userId,
          user,
          postId,
          notificationReachedLimit,
          'reply',
        );
      }
    }
    return {
      likeCount: 0,
      isLiked: false,
      ...reply,
    };
  }
  async checkReplyNotificationLimit(
    userId: string,
    postId: string,
  ): Promise<boolean> {
    const cacheKey = `replyNotifications:${postId}:${userId}`;
    const cachedData = await this.redisService.get(cacheKey);
    return cachedData!!;
  }
  async checkLikeReplyNotificationLimit(
    userId: string,
    postId: string,
  ): Promise<boolean> {
    const cacheKey = `replyLikeNotifications:${postId}:${userId}`;
    const cachedData = await this.redisService.get(cacheKey);
    return cachedData!!;
  }
  async handleReplyNotification(
    targetUserId: string,
    user: any,
    postId: string,
    hasReachedLimit: boolean,
    type: string,
  ) {
    if (!hasReachedLimit) {
      const cacheKey =
        type === 'liked'
          ? `replyLikeNotifications:${postId}:${user.id}`
          : `replyNotifications:${postId}:${user.id}`; // استخدم targetUserId للكاش

      await this.sendReplyNotification(targetUserId, user, postId, type);
      await this.redisService.set(cacheKey, 1, CACHE_TTL.REPLY_NOTIFICATION);
    }
  }

  async sendReplyNotification(
    targetUserId: string,
    user: any,
    postId: string,
    type: string,
  ) {
    const message =
      type === 'liked' ? `liked your reply` : `Replied on your comment`;
    const notificationData: NotificationData = {
      message,
      type: type === 'liked' ? 'LIKE' : 'COMMENT',
      userId: targetUserId,
      link: `/posts/${postId}`,
      metaData: { senderName: user.name, senderId: user.id },
      isRead: false,
    };
    await this.notificationQueue.add('send-notification', notificationData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
    });
  }
}
