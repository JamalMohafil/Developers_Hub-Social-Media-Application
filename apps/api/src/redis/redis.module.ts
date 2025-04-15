import { Module } from '@nestjs/common';
import { RedisService } from './services/redis.service';
import { ConfigModule } from '@nestjs/config';
import redisConfig from './config/redis.config';
@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [RedisService],
  exports: [RedisService], // Exporting RedisService for other modules to use
})
export class RedisModule {}
