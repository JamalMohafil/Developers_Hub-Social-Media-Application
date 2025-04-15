import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/auth/config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { TokenService } from 'src/auth/services/token.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserAuthService } from 'src/auth/services/user-auth.service';
import refreshConfig from 'src/auth/config/refresh.config';
import googleOauthConfig from 'src/auth/config/google-oauth.config';
import { RedisModule } from 'src/redis/redis.module';
import { CacheService } from 'src/common/services/cache.service';
import { UserService } from './services/user.service';
import { UserProfileService } from './services/user-profile.service';
import { ProfileService } from './services/profile.service';
import { extname, join } from 'path';

import mainConfig from 'src/common/config/main.config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { SharpPipe } from 'src/common/pipes/share.pipe';
import { FollowService } from './services/follow.service';
import { UploadFilesModule } from 'src/common/modules/multer.module';
import { ProjectsService } from './services/projects.service';
import { SkillsService } from './services/skills.service';
import { CheckUserGuard } from 'src/auth/guards/check-user/check-user.guard';
import redisConfig from 'src/redis/config/redis.config';
import { BullModule } from '@nestjs/bullmq';
import { NotificationProcessor } from 'src/jobs/notification.processor';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { NotificationModule } from 'src/notification/notification.module';
import { UserNotificationService } from './services/userNotifications.service';
import { UserRepository } from './user.repository';
const uploadDir = join(process.cwd(), 'uploads');

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    forwardRef(() => AuthModule),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshConfig),
    ConfigModule.forFeature(mainConfig),
    ConfigModule.forFeature(redisConfig),
    UploadFilesModule,
    BullModule.registerQueue({
      name: 'notifications',
    }),
    NotificationModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserProfileService,
    ProfileService,
    TokenService,
    JwtStrategy,
    UserAuthService,
    ProjectsService,
    SkillsService,
    SharpPipe,
    NotificationProcessor,
    UserNotificationService,
    TokenService,
    UserRepository,
    CacheService,
    FollowService,
    CheckUserGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [UserService, UserRepository], // ✅ تصدير `UserService` ليتمكن `AuthModule` من استخدامه
})
export class UserModule {}
