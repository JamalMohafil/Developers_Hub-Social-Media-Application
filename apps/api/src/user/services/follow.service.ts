import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from './user.service';
import { RedisService } from 'src/redis/services/redis.service';
import { NotificationType } from '@prisma/client';
import { NotificationData } from 'src/notification/types/notification.interface';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { UserRepository } from '../user.repository';
import { CACHE_TTL } from 'src/constants';

@Injectable()
export class FollowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
  ) {}
  async getAllFollowersByUserId(
    profileId: string,
    limit: number,
    page: number,
  ) {
    console.log(page);
    const skip = (page - 1) * limit;
    console.log(page, 'pages');
    console.log(limit, 'lites');
    console.log(skip, 'skiption');
    console.log(profileId, 'prolfile ');
    const followersFromProfile = await this.prisma.follow.findMany({
      where: {
        followingId: profileId,
      },
      include: {
        follower: {
          include: {
            user: {
              select: { name: true, username: true, image: true, id: true },
            },
          },
        },
      },
      take: limit,
      skip: skip,
    });
    console.log(followersFromProfile, 'followersFromProfile');
    const followers = followersFromProfile.map((follower) => ({
      name: follower.follower.user.name,
      username: follower.follower.user.username,
      image: follower.follower.user.image,
      id: follower.follower.user.id,
    }));

    return followers;
  }

  async getAllFollowingByUserId(
    profileId: string,
    limit: number,
    page: number,
  ) {
    const skip = (page - 1) * limit;
    console.log(page);

    const followingUsers = await this.prisma.follow.findMany({
      where: {
        followerId: profileId,
      },
      include: {
        following: {
          include: {
            user: {
              select: { name: true, username: true, image: true, id: true },
            },
          },
        },
      },
      take: limit,
      skip: skip,
    });

    const following = followingUsers.map((followingUser) => ({
      name: followingUser.following.user.name,
      username: followingUser.following.user.username,
      image: followingUser.following.user.image,
      id: followingUser.following.user.id,
    }));

    return following;
  }

  // follow.service.ts
  async follow(profileId: string, user: any) {
    // التحقق من صلاحية المستخدمين
    const targetUserId =
      await this.userRepository.getUserIdByProfileId(profileId);
    console.log(targetUserId, user, 'profile id');
    if (!user.profileId || !targetUserId) {
      throw new NotFoundException('User profile not found');
    }

    // التحقق من حد الإشعارات
    const notificationLimitReached = await this.checkNotificationLimit(user.id);

    try {
      // إنشاء علاقة المتابعة
      const follow = await this.createFollowRelation(user.profileId, profileId);

      // تحديث الكاش والإشعارات
      await this.handleFollowSuccess(
        targetUserId,
        user,
        notificationLimitReached,
      );

      return {
        success: true,
        data: { id: follow.id },
      };
    } catch (error) {
      this.handleFollowError(error);
    }
  }

  async unfollow(profileId: string, user: any) {
    // التحقق من صلاحية المستخدمين
    const targetUserId =
      await this.userRepository.getUserIdByProfileId(profileId);
    if (!user.profileId || !targetUserId) {
      throw new NotFoundException('User profile not found');
    }

    try {
      // حذف علاقة المتابعة
      const unfollow = await this.deleteFollowRelation(
        user.profileId,
        profileId,
      );

      // تحديث الكاش
      await this.updateCacheAfterFollow(targetUserId, user.id, false);

      return {
        success: true,
        data: { id: unfollow.id },
      };
    } catch (error) {
      this.handleUnfollowError(error);
    }
  }

  // التحقق من حد الإشعارات
  private async checkNotificationLimit(userId: string): Promise<boolean> {
    const notificationLimitCacheKey = `follow:${userId}`;
    const notificationLimitCacheData = await this.redisService.get(
      notificationLimitCacheKey,
    );
    return !!notificationLimitCacheData;
  }

  // إنشاء علاقة متابعة
  private async createFollowRelation(followerId: string, followingId: string) {
    console.log(followerId, followingId);
    return await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });
  }

  // حذف علاقة متابعة
  private async deleteFollowRelation(followerId: string, followingId: string) {
    return await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  // معالجة نجاح المتابعة
  private async handleFollowSuccess(
    targetUserId: string,
    user: any,
    notificationLimitReached: boolean,
  ) {
    // تحديث الكاش بشكل متوازٍ مع إرسال الإشعارات
    await Promise.all([
      this.updateCacheAfterFollow(targetUserId, user.id, true),
      this.handleFollowNotification(
        targetUserId,
        user,
        notificationLimitReached,
      ),
    ]);
  }

  // معالجة الإشعارات
  private async handleFollowNotification(
    targetUserId: string,
    user: any,
    notificationLimitReached: boolean,
  ) {
    if (!notificationLimitReached) {
      await this.sendFollowNotification(
        targetUserId,
        user.image,
        user.id,
        user.name || '',
      );

      // تعيين حد الإشعارات
      const notificationLimitCacheKey = `follow:${user.id}`;
      await this.redisService.set(
        notificationLimitCacheKey,
        1,
        CACHE_TTL.FOLLOW_NOTIFICATION,
      );
    }
  }

  // معالجة أخطاء المتابعة
  private handleFollowError(error: any) {
    if (error.code === 'P2002') {
      throw new BadRequestException('Already following this user');
    }
    throw error;
  }

  // معالجة أخطاء إلغاء المتابعة
  private handleUnfollowError(error: any) {
    if (error.code === 'P2025') {
      throw new BadRequestException('Already unfollowing this user');
    }
    throw error;
  }

  // تحديث الكاش بعد المتابعة أو إلغاءها
  private async updateCacheAfterFollow(
    targetProfileId: string,
    currentUserId: string,
    isFollow: boolean,
  ) {
    const modifier = isFollow ? 1 : -1;

    // مفاتيح الكاش
    const targetProfileCacheKey = `profile:${targetProfileId}`;
    console.log(targetProfileId, 'targetProfileId');
    console.log(currentUserId, 'currentUserId');
    const currentUserProfileCacheKey = `profile:${currentUserId}`;
    const followCacheKey = `follow:${currentUserId}:${targetProfileId}`;

    // استرداد الكاش لكلا الملفين الشخصيين بالتوازي
    const [cachedCurrentUserProfile, cachedTargetProfile] = await Promise.all([
      this.redisService.get(currentUserProfileCacheKey),
      this.redisService.get(targetProfileCacheKey),
    ]);

    // إعداد عمليات التحديث
    const pipeline = this.redisService.pipeline();

    // تحديث كاش المتابعة
    pipeline.set(followCacheKey, isFollow, 3600);

    // تحديث كاش الملف الشخصي للمستخدم الحالي
    if (cachedCurrentUserProfile) {
      const updatedCurrentUserProfile = {
        ...cachedCurrentUserProfile,
        followingCount: Math.max(
          0,
          (cachedCurrentUserProfile.followingCount || 0) + modifier,
        ),
      };
      pipeline.del(currentUserProfileCacheKey);
      pipeline.set(currentUserProfileCacheKey, updatedCurrentUserProfile, 3600);
    }

    // تحديث كاش الملف الشخصي للمستخدم المستهدف
    if (cachedTargetProfile) {
      const updatedTargetProfile = {
        ...cachedTargetProfile,
        followersCount: Math.max(
          0,
          (cachedTargetProfile.followersCount || 0) + modifier,
        ),
        // تحديث حالة المتابعة إذا كان الملف محدد لنفس المستخدم
        ...(cachedTargetProfile.userId === currentUserId
          ? { isFollowing: isFollow }
          : {}),
      };
      pipeline.del(targetProfileCacheKey);
      pipeline.set(targetProfileCacheKey, updatedTargetProfile, 3600);
    }

    // تنفيذ جميع العمليات دفعة واحدة
    await pipeline.exec();
  }

  async sendFollowNotification(
    userId: string,
    followerImageUrl: string,
    followerUserId: string,
    senderName: string,
  ) {
    const message = `${senderName} started following you`;
    const notificationData: NotificationData = {
      userId: userId,
      metaData: { senderId: followerUserId, senderName },
      type: NotificationType.FOLLOW,
      message,
      imageUrl: followerImageUrl,
      link: `/profile/${userId}`,
    };

    // إرسال الإشعار عبر BullMQ
    await this.notificationQueue.add('add-notification', notificationData, {
      attempts: 3, // عدد المحاولات في حالة الفشل
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true, // إزالة المهمة بعد الإكمال
    });
  }
  async getFollowingStatus(
    myUserId: string,
    targetUserId: string,
  ): Promise<boolean> {
    const followCacheKey = `follow:${myUserId}:${targetUserId}`;
    const cachedFollowStatus = await this.redisService.get(followCacheKey);

    // // استخدام القيمة المخزنة مؤقتًا إذا كانت متوفرة
    // if (cachedFollowStatus !== null) {
    //   return cachedFollowStatus === true || cachedFollowStatus === 'true';
    // }

    console.log(myUserId, 'myUserId', targetUserId, 'targetUserId');
    // استعلام من قاعدة البيانات وتخزين النتيجة
    const isFollowing = await this.checkIfFollowing(myUserId, targetUserId);
    console.log(isFollowing, 'isFollowing');
    // تخزين النتيجة في الكاش
    await this.redisService
      .set(followCacheKey, isFollowing, 3600)
      .catch((err) => console.error('Redis follow caching error:', err));

    return isFollowing;
  }
  async checkIfFollowing(
    currentUserId: string,
    profileId: string,
  ): Promise<boolean> {
    const ownProfileId =
      await this.userRepository.getProfileIdByUserId(currentUserId);
    if (!ownProfileId) return false;

    console.log(ownProfileId, 'ownProfile', profileId, 'profiled');
    const follow = await this.prisma.follow.findFirst({
      where: { followerId: ownProfileId, followingId: profileId },
    });
    console.log(follow, 'fololwf');
    return !!follow;
  }
}
