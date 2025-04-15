import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { CreateOAuthUserDto } from '../dto/create-oauth-user';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/services/redis.service';
import { CacheService } from 'src/common/services/cache.service';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class UserAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly cacheService: CacheService,
    private readonly userRepository: UserRepository,
  ) {}

  async create(createUserDto: CreateUserDto, isGoogle?: boolean) {
    const { password, ...user } = createUserDto;

    if (!password || password.trim() === '') {
      throw new BadRequestException('Password is required');
    }

    const hashedPassword = await hash(password);

    // إنشاء المستخدم
    const createdUser = await this.prisma.user.create({
      data: {
        ...user,
        password: hashedPassword,
        emailVerified: isGoogle === true,
      },
    });

    // إنشاء البروفايل
    const profile = await this.prisma.profile.create({
      data: { userId: createdUser.id },
    });

    // تحديث المستخدم وربط الـ profileId
    const updatedUser = await this.prisma.user.update({
      where: { id: createdUser.id },
      data: { profileId: profile.id },
    });

    return updatedUser;
  }

  async createOAuthUser(createOAuthUserDto: CreateOAuthUserDto) {
    const user = createOAuthUserDto;

    const createdUser = await this.prisma.user.create({
      data: {
        ...user,

        password: ' ',
        emailVerified: true,
      },
    });
    // إنشاء البروفايل
    const profile = await this.prisma.profile.create({
      data: { userId: createdUser.id },
    });

    // تحديث المستخدم وربط الـ profileId
    const updatedUser = await this.prisma.user.update({
      where: { id: createdUser.id },
      data: { profileId: profile.id },
    });

    return updatedUser;
  }

  // مثال للتخزين المؤقت مع مفاتيح وصفية
  async getAll() {
    // const cacheKey = 'users';
    // const cachedUsers = await this.redisService.hgetall(cacheKey);
    // if (Object.keys(cachedUsers).length > 0) {
    //   return Object.values(cachedUsers);
    // }
    await this.prisma.user.findMany();
    await this.prisma.user.findMany();
    await this.prisma.user.findMany();
    await this.prisma.user.findMany();
    await this.prisma.user.findMany();
    await this.prisma.user.findMany();
    await this.prisma.user.findMany();
    await this.prisma.user.findMany();
    await this.prisma.user.findMany();
    await this.prisma.user.findMany();
    await this.prisma.user.findMany();
    await this.prisma.user.findMany();
    await this.prisma.user.findMany();
    await this.prisma.user.findMany();
    await this.prisma.user.findMany();

    const users = await this.prisma.user.findMany();

    // for (const user of users) {
    //   await this.redisService.hset(cacheKey, user.id, user);
    // }

    return users;
  }

  async getMe(id: string) {
    const cachedUserKey = `user:${id}`;

    const user = await this.cacheService.getCachedData(
      cachedUserKey,
      async () => {
        const userData = await this.userRepository.findUserById(id);
        const profileId = await this.userRepository.getProfileIdByUserId(id);
        if (!userData) {
          return null;
        }

        const { hashedRefreshToken, ...filteredUser } = userData;
        return { ...filteredUser, profileId };
      },
    );
    return user;
  }

  async update(userId: string, updateUserDto: Record<string, any>) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });
  }

  async updatePassword(userId: string, password: string) {
    const hashedPassword = await hash(password);
    return await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async updateResetToken(userId: string, token: string | null): Promise<void> {
    await this.update(userId, { resetToken: token });
  }
}
