import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as otpGenerator from 'otp-generator';
import { RedisService } from 'src/redis/services/redis.service';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import mainConfig from 'src/common/config/main.config';
import { ConfigType } from '@nestjs/config';
import { TokenService } from 'src/auth/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { FollowService } from './follow.service';
import { UserRepository } from '../user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly followService: FollowService,
    private readonly redisService: RedisService,
    private readonly userRepository: UserRepository,
  ) {}

  async getUserProfile(userId: string, token?: string | null) {
    // 1. استخراج معرف المستخدم الحالي
    const myUserId = await this.userRepository.extractCurrentUserId(token);

    // 2. محاولة استرداد البيانات من الكاش
    const profileCacheKey = `profile:${userId}`;
    const cachedProfile = await this.redisService.get(profileCacheKey);

    if (cachedProfile) {
      return await this.handleCachedProfileData(cachedProfile, myUserId);
    }

    // 3. استرداد البيانات من قاعدة البيانات إذا لم تكن في الكاش
    return await this.fetchAndCacheProfileData(userId, myUserId);
  }

  private async handleCachedProfileData(
    cachedProfile: any,
    myUserId: string | null,
  ) {
    const profileData = this.formatCachedProfile(cachedProfile);

    // إضافة معلومات المتابعة للمستخدمين المسجلين
    if (myUserId && myUserId !== profileData.userId) {
      const isFollowing = await this.followService.getFollowingStatus(
        myUserId,
        profileData.id,
      );
      return { ...profileData, isFollowing };
    }

    return { ...profileData, isFollowing: false };
  }

  private async fetchAndCacheProfileData(
    userId: string,
    myUserId: string | null,
  ) {
    // استعلام عن الملف الشخصي

    const profile = await this.loadFullProfile(userId);
    if (!profile) {
      throw new NotFoundException('User not found');
    }

    // استعلام الإحصائيات بالتوازي
    const [followersCount, followingCount, postsCount] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: profile.id } }),
      this.prisma.follow.count({ where: { followerId: profile.id } }),
      this.prisma.post.count({ where: { userId: profile.userId } }),
    ]);

    // تكوين البيانات الأساسية
    const baseResult = {
      ...profile,
      followersCount,
      followingCount,
      postsCount,
    };

    // تخزين البيانات في الكاش
    const profileCacheKey = `profile:${userId}`;
    this.redisService
      .set(profileCacheKey, baseResult, 3600)
      .catch((err) => console.error('Redis profile caching error:', err));

    // إضافة حالة المتابعة للمستخدمين المسجلين
    let isFollowing = false;
    console.log('isfollowcheck1');
    if (myUserId && myUserId !== userId) {
      console.log('isfollowcheck2');
      isFollowing = await this.followService.checkIfFollowing(
        myUserId,
        profile.id,
      );

      // تخزين حالة المتابعة في كاش منفصل
      const followCacheKey = `follow:${myUserId}:${profile.userId}`;
      this.redisService
        .set(followCacheKey, isFollowing, 3600)
        .catch((err) => console.error('Redis follow caching error:', err));
    }

    return { ...baseResult, isFollowing };
  }

  private async loadFullProfile(userId: string) {
    return this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { name: true, image: true, username: true },
        },
        skills: true,
        socialLinks: true,
      },
    });
  }

  private formatCachedProfile(cached: any) {
    const { user, ...rest } = cached;
    return {
      ...rest,
      user: {
        name: user?.name,
        username: user?.username,
        image: user?.image,
        posts: user?.posts,
      },
    };
  }
}
