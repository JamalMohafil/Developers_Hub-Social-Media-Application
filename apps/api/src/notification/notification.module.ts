import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports:[RedisModule,RedisModule],
  providers: [NotificationGateway,],
  exports: [NotificationGateway],
})
export class NotificationModule {}
