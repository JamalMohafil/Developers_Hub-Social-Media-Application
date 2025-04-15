import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RateLimiterService {
  constructor(private readonly redisService: RedisService) {}

  async rateLimit(key: string, limit: number, ttl: number): Promise<void> {
    const currentKey = `rate_limiter:${key}`;
    // الحصول على عدد الطلبات الحالية للمستخدم
    const currentRequests = await this.redisService.get(currentKey);

    if (currentRequests) {
      const requests = parseInt(currentRequests, 10);

      // إذا تجاوز المستخدم الحد المسموح به
      if (requests >= limit) {
        throw new HttpException(
          'Too many requests, please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    // زيادة عدد الطلبات
    await this.redisService.increment(currentKey);

    // تعيين TTL (وقت انتهاء الصلاحية) إذا لم يكن موجودًا
    if (!currentRequests) {
      await this.redisService.setex(currentKey, ttl, '1');
    }
  }
}
