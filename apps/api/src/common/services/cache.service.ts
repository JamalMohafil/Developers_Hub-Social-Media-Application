// cache.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/services/redis.service';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  async getCachedData<T>(
    cacheKey: string,
    fetchData: () => Promise<T>,
    ttl?: number,
    noSet?: boolean,
  ) {
    try {
      const cached = await this.redisService.get(cacheKey);
 
      if (cached) {
        return cached; 
      }

       const data = await fetchData();
       if (noSet !== true) {
          await this.redisService.set(cacheKey,data,ttl || 3600,);
       }
      return data;
    } catch (error) {
      console.error('❌ Error in cache operation:', error.message);
      throw error;  
    }
  }
}
