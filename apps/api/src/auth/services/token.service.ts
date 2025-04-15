import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verify } from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import { UserAuthService } from './user-auth.service';
import { JwtService } from '@nestjs/jwt';
import refreshConfig from '../config/refresh.config';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { RedisService } from 'src/redis/services/redis.service';
import { CacheService } from 'src/common/services/cache.service';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userAuthService: UserAuthService,
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly cacheService: CacheService,
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
  ) {}
  // async updateHashedRefreshToken(userId: string, hashedRT: string | null) {
  //   return await this.prisma.user.update({
  //     where: {
  //       id: userId,
  //     },
  //     data: {
  //       hashedRefreshToken: hashedRT,
  //     },
  //   });
  // }
  async generateTokens(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      // this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);
    return {
      accessToken,
      // refreshToken,
    };
  }

  async validateJwtUser(userId: string) {
    const cachedUserKey = `user:${userId}`;
    const user = await this.cacheService.getCachedData(
      cachedUserKey,
      async () => {
        const user = await this.userRepository.findUserById(userId);

        if (!user) {
          throw new UnauthorizedException('User not found');
        }
        return {
          id: user.id,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
      3600,
      true,
    );
    return user;
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userRepository.findUserById(userId);
    if (!user?.hashedRefreshToken) {
      throw new UnauthorizedException('No hashed refresh token found');
    }
    const refreshTokenMatched = await verify(
      user.hashedRefreshToken,
      refreshToken,
    );

    if (!refreshTokenMatched) {
      throw new UnauthorizedException('Invalid Refresh Token!');
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { id: user.id, role: user.role };
  }

  // async refreshToken(userId: string, username: string) {
  //   const { accessToken, refreshToken } = await this.generateTokens(userId);
  //   return {
  //     user: {
  //       id: userId,
  //       username,
  //     },
  //     accessToken,
  //     refreshToken,
  //   };
  // }

  async generateResetToken(userId: string) {
    const token = this.jwtService.sign({ userId }, { expiresIn: '15m' });
    return token;
  }
  checkResetPasswordToken(resetToken: string): void {
    try {
      // تحقق من التوكن
      const decoded = this.jwtService.verify(resetToken);

      const expirationTime = decoded.exp * 1000; // تحويل إلى ms
      const currentTime = Date.now();

      if (expirationTime > currentTime) {
        const remainingSeconds = Math.ceil(
          (expirationTime - currentTime) / 1000,
        );
        throw new HttpException(
          `You already requested a reset. Please wait ${remainingSeconds} seconds before requesting again.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // إذا انتهى التوكن، نكمل عادي بدون خطأ
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      // إذا كان JWT نفسه منتهي أو غير صالح، نكمل أيضًا لإنشاء توكن جديد
    }
  }
}
