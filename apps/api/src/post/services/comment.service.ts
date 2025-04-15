import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/services/redis.service';
import { Queue } from 'bullmq';
import { UserRepository } from 'src/user/user.repository';
import { PostStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PostRepository } from '../post.repository';
import { CACHE_TTL } from 'src/constants';
import { InjectQueue } from '@nestjs/bullmq';
import { NotificationData } from 'src/notification/types/notification.interface';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
    private readonly postRepository: PostRepository,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
  ) {}
  async addComment(postId: string, user: any, content: string) {
    if (!postId) {
      throw new NotFoundException('Post not found');
    }

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        postId: postId,
        userId: user.id,
        content,
      },
      include: {
        user: { select: { username: true, name: true, image: true, id: true } },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    if (post.userId !== user.id) {
      console.log('post.userId', post.userId);
      console.log('post.userId', user.id);
      const notificationReachedLimit = await this.checkCommentNotificationLimit(
        user.id,
        comment.id,
      );

      if (!notificationReachedLimit) {
        await this.handleCommentNotification(
          post.userId,
          user,
          postId,
          notificationReachedLimit,
          'comment',
          comment.id,
        );
      }
    }
    // إعداد التعليق بنفس تنسيق getPostComments
    const formattedComment = {
      ...comment,
      likeCount: comment._count.likes,
      replyCount: comment._count.replies,
      isLiked: false,
    };
    delete (formattedComment as any)._count;
    // إلغاء صلاحية جميع مفاتيح كاش المرتبطة بهذا المنشور
    await this.postRepository.invalidatePostCommentsCache(postId);

    return formattedComment;
  }

  // إضافة دالة لإلغاء صلاحية كاش المنشور

  async getPostComments(
    postId: string,
    limit: number,
    page: number,
    sortBy: string,
    accessToken: string,
  ) {
    // تحسين مفتاح الكاش لتجنب التكرارات غير الضرورية
    let userId: string | null = null;
    if (accessToken) {
      userId = await this.userRepository.extractUserIdFromToken(accessToken);
    }

    const cacheKey = `post_comments:${postId}:${page}:${limit}:${sortBy}:${userId || 'anonymous'}`;

    // محاولة الحصول على البيانات من الكاش
    const cachedResult = await this.redisService?.get(cacheKey);
    console.log(cachedResult, 'cachedResultComments');
    if (cachedResult) {
      return cachedResult; // تحويل البيانات المخزنة إلى كائن جافاسكريبت
    }

    // التحقق من وجود المنشور
    const postExists = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!postExists) {
      throw new NotFoundException('Post not found');
    }

    const skip = (page - 1) * limit;
    const sortByValue = sortBy === 'desc' ? 'desc' : 'asc';

    // استعلام التعليقات
    const comments = await this.prisma.comment.findMany({
      where: {
        postId,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: sortByValue,
      },
      include: {
        user: {
          select: { username: true, name: true, image: true, id: true },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
        ...(userId
          ? {
              likes: {
                where: { userId },
                select: { id: true },
                take: 1,
              },
            }
          : {}),
      },
    });
    console.log(comments, 'cachedResultComments2');
    // معالجة النتائج
    const result = comments.map((comment) => {
      const { _count, likes, ...commentData } = comment;
      return {
        ...commentData,
        likeCount: _count.likes,
        replyCount: _count.replies,
        ...(userId ? { isLiked: likes && likes.length > 0 } : {}),
      };
    });

    // تخزين النتيجة في الكاش
    if (this.redisService) {
      // تخزين كسلسلة نصية (JSON) لتجنب مشاكل التسلسل
      await this.redisService.set(cacheKey, result, CACHE_TTL.POST_COMMENTS); // تخزين لمدة 60 ثانية
    }

    return result;
  }

  // أيضاً، يجب تعديل دالة likeComment لإلغاء صلاحية الكاش
  async likeComment(commentId: string, user: any) {
    // التحقق من وجود التعليق أولا للفشل السريع قبل بدء المعاملة
    const commentCheck = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, postId: true, userId: true },
    });

    if (!commentCheck) {
      throw new NotFoundException('Comment not found');
    }

    const postId = commentCheck.postId;
    let action = 'liked';

    // استخدام updateMany مع upsert pattern بدلاً من البحث ثم الإنشاء/الحذف
    try {
      const existingLike = await this.prisma.like.findUnique({
        where: {
          commentId_userId: {
            commentId: commentId,
            userId: user.id,
          },
        },
      });

      if (existingLike) {
        // حذف الإعجاب إذا كان موجودًا
        await this.prisma.like.delete({
          where: {
            commentId_userId: {
              commentId: commentId,
              userId: user.id,
            },
          },
        });
        action = 'unliked';
      } else {
        // إنشاء إعجاب جديد
        await this.prisma.like.create({
          data: {
            commentId: commentId,
            userId: user.id,
          },
        });

        if (commentCheck.userId !== user.id) {
          const notificationReachedLimit =
            await this.checkLikeCommentNotificationLimit(
              user.id,
              commentCheck.id,
            );
          console.log(
            notificationReachedLimit,
            'notificationReachedLimit For Like',
            commentCheck.userId,
            user.id,
          );

          if (!notificationReachedLimit) {
            await this.handleCommentNotification(
              commentCheck.userId,
              user,
              postId,
              notificationReachedLimit,
              'liked',
              commentCheck.id,
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
        message: `Comment ${action} Successfully`,
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

  async deleteComment(commentId: string, postId: string, user: any) {
    try {
      const commentExists = await this.prisma.comment.findUnique({
        where: { id: commentId },
        select: { id: true, userId: true },
      });
      if (!commentExists) {
        return new NotFoundException('Comment Not Found');
      }
      if (commentExists.userId !== user.id) {
        return new UnauthorizedException(
          'You are not allowed to perform this action',
        );
      }

      await this.prisma.comment.delete({ where: { id: commentId } });
      this.postRepository
        .invalidatePostCommentsCache(postId)
        .catch((error) => console.error('Failed to invalidate cache:', error));
      return new HttpException('Comment Deleted Successfully', HttpStatus.OK);
    } catch (e) {
      return new InternalServerErrorException(
        'Something Went Wrong' + e.message,
      );
    }
  }

  async updateComment(
    postId: string,
    commentId: string,
    content: string,
    user: any,
  ) {
    try {
      const commentExists = await this.prisma.comment.findUnique({
        where: { id: commentId },
        select: { id: true, userId: true },
      });
      if (!commentExists) {
        throw new NotFoundException('Comment Not Found');
      }
      console.log(user);
      console.log(commentExists);
      if (commentExists.userId !== user.id) {
        throw new UnauthorizedException(
          'You are not allowed to perform this action',
        );
      }

      await this.prisma.comment.update({
        where: { id: commentId },
        data: { content: content },
      });
      await this.postRepository
        .invalidatePostCommentsCache(postId)
        .catch((error) => console.error('Failed to invalidate cache:', error));
      return new HttpException('Comment Updated Successfully', HttpStatus.OK);
    } catch (e) {
      throw new InternalServerErrorException(
        'Something Went Wrong' + e.message,
      );
    }
  }

  async checkCommentNotificationLimit(
    userId: string,
    commentId: string,
  ): Promise<boolean> {
    const cacheKey = `commentNotifications:${commentId}:${userId}`;
    console.log(userId);
    const cachedData = await this.redisService.get(cacheKey);
    console.log(cachedData);
    return cachedData!!;
  }
  async checkLikeCommentNotificationLimit(
    userId: string,
    commentId: string,
  ): Promise<boolean> {
    const cacheKey = `commentLikeNotifications:${commentId}:${userId}`;
    const cachedData = await this.redisService.get(cacheKey);
    console.log(commentId, 'cachedKey from check like3');
    console.log(userId, 'cachedKey from check like2');
    console.log(cachedData, 'cachedKey from check like');
    return cachedData!!;
  }
  async handleCommentNotification(
    targetUserId: string,
    user: any,
    postId: string,
    hasReachedLimit: boolean,
    type: string,
    commentId: string,
  ) {
    if (!hasReachedLimit) {
      console.log(commentId, 'cachedKey from check like3');
      console.log(user.id, 'cachedKey from check like2');
      const cacheKey =  
        type === 'liked'
          ? `commentLikeNotifications:${commentId}:${user.id}`
          : `commentNotifications:${commentId}:${user.id}`; // استخدم targetUserId للكاش
      console.log(cacheKey);
      await this.sendCommentNotification(targetUserId, user, postId, type);
      await this.redisService.set(cacheKey, 1, 3600);
    }
  }

  async sendCommentNotification(
    targetUserId: string,
    user: any,
    postId: string,
    type: string,
  ) {
    const message =
      type === 'liked' ? `liked your comment` : `commented on your post`;
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
