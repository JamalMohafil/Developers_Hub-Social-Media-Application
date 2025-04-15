import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';

import { RedisModule } from './redis/redis.module';
import { RedisService } from './redis/services/redis.service';
import { RateLimiterService } from './redis/services/rate-limiter.service';
import { RateLimiterGuard } from './redis/guards/rate-limiter.guard';
import { BullModule } from '@nestjs/bullmq';
import { SendOtpProcessor } from './jobs/send-otp.processor';
import { NotificationModule } from './notification/notification.module';
import redisConfig from './redis/config/redis.config';
import { NotificationProcessor } from './jobs/notification.processor';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PostModule,
    NotificationModule,
    UserModule,
    PrismaModule,
    RedisModule,
    BullModule.forRoot({ connection: { host: 'localhost', port: 6379 } }),
    BullModule.registerQueue({
      name: 'send-otp',
    }),
    BullModule.registerQueue({
      name: 'notifications',
    }),
    ConfigModule.forFeature(redisConfig),
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.MAIL_PORT || '587'),
        tls: { rejectUnauthorized: false },
        debug: true, // show debug output
        logger: true, // log information in console
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"Developers Hub" <${process.env.EMAIL_USERNAME}>`,
      },
    }),
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RedisService,
    RateLimiterService,
    SendOtpProcessor,
    NotificationProcessor,
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
  ],
})
export class AppModule {}
