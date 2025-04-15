import { forwardRef, Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationModule } from 'src/notification/notification.module';
import { BullModule } from '@nestjs/bullmq';
import { UploadFilesModule } from 'src/common/modules/multer.module';
import { ConfigModule } from '@nestjs/config';
import redisConfig from 'src/redis/config/redis.config';
import mainConfig from 'src/common/config/main.config';
import refreshConfig from 'src/auth/config/refresh.config';
import jwtConfig from 'src/auth/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from 'src/redis/redis.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from 'src/user/user.repository';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { PostService } from './services/post.service';
import { TagService } from './services/tag.service';
import { CategoryService } from './services/category.service';
import { CommentService } from './services/comment.service';
import { ReplyService } from './services/reply.service';
import { PostRepository } from './post.repository';

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
  controllers: [PostController],
  providers: [
    PostService,
    TagService,
    CategoryService,
    CommentService,
    ReplyService,
    PostRepository,
    UserRepository,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class PostModule {}
