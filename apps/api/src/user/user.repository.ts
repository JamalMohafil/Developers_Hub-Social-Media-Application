// src/user/user.repository.ts
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import mainConfig from 'src/common/config/main.config';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/services/redis.service';

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    @Inject(mainConfig.KEY)
    private readonly mainConfiguration: ConfigType<typeof mainConfig>,
  ) {}

  async findByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: {
        username: username,
      },
    });
  }
  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async getProfileByUserId(userId: string) {
    const cacheKey = `profile:${userId}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const profile = await this.prisma.profile.findUnique({
      where: { userId: userId },
      include: { user: true },
    });
    return profile;
  }
  async getProfileIdByUserId(userId: string) {
    const cacheKey = `user:${userId}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData.profileId;
    }
    const profile = await this.prisma.profile.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    return profile?.id;
  }
  async getUserIdByProfileId(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { userId: true },
    });
    return profile?.userId;
  }

  async getUserByProfileId(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { user: true },
    });

    return { ...profile?.user };
  }

  // User
  async findUserById(userId: string) {
    const cacheKey = `user:${userId}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
  async checkUsernameAvailability(username: string, userId?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (userId && existingUser) {
      if (existingUser?.id !== userId) {
        throw new BadRequestException('Username is already taken');
      }
    } else if (existingUser) {
      throw new BadRequestException('Username is already taken');
    }
  }
  getImageUrl(imageName?: string | null): string | null {
    if (!imageName) return null;
    if (imageName.startsWith(this.mainConfiguration.API_URL!!))
      return imageName;
    return `${this.mainConfiguration.API_URL}/uploads/${imageName}`;
  }
  async extractUserIdFromToken(token: string): Promise<string | null> {
    if (!token || token.split('.').length !== 3) {
      console.warn('Malformed or empty token:', token);
      return null;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      return payload?.sub || null; // أو حسب طريقة حفظ الـ userId
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return null;
    }
  }
  async validateToken(token: string): Promise<boolean> {
    try {
      // تنفيذ التحقق من صلاحية التوكن
      // هذا مثال بسيط، يجب تعديله حسب آلية التوثيق المستخدمة
      const decoded = this.jwtService.verify(token);
      return !!decoded && !!decoded.sub;
    } catch (error) {
      return false;
    }
  }
  async extractCurrentUserId(token?: string | null): Promise<string | null> {
    if (!token) return null;

    try {
      return await this.extractUserIdFromToken(token);
    } catch (error) {
      console.error('Error extracting user ID from token:', error);
      return null;
    }
  }

  getAccessTokenFromHeaders(headers: any) {
    const authHeader = headers.authorization || null;
    const accessToken = authHeader
      ? authHeader.startsWith('Bearer ')
        ? authHeader.replace('Bearer ', '')
        : authHeader
      : null;

    return accessToken;
  }
}
