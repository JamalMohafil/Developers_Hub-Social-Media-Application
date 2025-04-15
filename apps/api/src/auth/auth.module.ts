import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from 'src/user/user.module'; // ✅ استيراد UserModule
import { PrismaModule } from 'src/prisma/prisma.module';
import { localStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import refreshConfig from './config/refresh.config';
import googleOauthConfig from './config/google-oauth.config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { AuthController } from './controllers/auth.controller';
import { PasswordService } from './services/password.service';
import { UserAuthService } from './services/user-auth.service';
import { EmailService } from './services/email.service';
import mailerConfig from './config/mailer.config';
import { GoogleStrategy } from './strategies/google.strategy';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisModule } from 'src/redis/redis.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh-token.strategy';
import { CacheService } from 'src/common/services/cache.service';
import { SendOtpProcessor } from 'src/jobs/send-otp.processor';
import { BullModule } from '@nestjs/bullmq';
import mainConfig from 'src/common/config/main.config';
import { CheckUserGuard } from './guards/check-user/check-user.guard';
import { CheckUserStrategy } from './strategies/check-user.strategy';
import { UserRepository } from 'src/user/user.repository';
import { AuthProcessor } from 'src/jobs/auth.processor';

@Module({
  imports: [
    // forwardRef(() => UserModule), // ✅ استخدام `forwardRef`
    PrismaModule,
    RedisModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshConfig),
    ConfigModule.forFeature(googleOauthConfig),
    ConfigModule.forFeature(mailerConfig),
    ConfigModule.forFeature(mainConfig),
    BullModule.registerQueue({ name: 'send-otp' }, { name: 'auth' }),
    CacheModule.register(), // إضافة CacheModule هنا
  ],
  controllers: [AuthController],
  providers: [
    PasswordService,
    AuthService,
    TokenService,
    EmailService,
    CheckUserGuard,
    RefreshStrategy,
    GoogleStrategy,
    localStrategy,
    JwtStrategy,
    UserAuthService,
    GoogleStrategy,
    SendOtpProcessor,
    CheckUserStrategy,
    AuthProcessor,
    UserRepository,
    CacheService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [
    AuthService,
    SendOtpProcessor,
    TokenService,
    UserAuthService,
    TokenService,
    EmailService,
    CheckUserGuard,
    CheckUserStrategy,
  ], // ✅ تصدير `AuthService` و `TokenService`
})
export class AuthModule {}
