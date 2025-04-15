import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import * as Redis from 'ioredis';
import { env } from 'process';
import { ConfigType } from '@nestjs/config';
import redisConfig from '../config/redis.config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(redisConfig.KEY)
    private readonly redisConfiguration: ConfigType<typeof redisConfig>,
  ) {}
  public redisClient: Redis.Redis;
  public publisher: Redis.Redis;
  public subscriber: Redis.Redis;
  // عند تهيئة الوحدة

  onModuleInit() {
    const redisConfig = {
      host: this.redisConfiguration.host!!,
      port: this.redisConfiguration.port!! as number,
    };
    this.redisClient = new Redis.Redis(redisConfig);
    this.publisher = new Redis.Redis(redisConfig);
    this.subscriber = new Redis.Redis(redisConfig);
  }
  // عند تدمير الوحدة
  onModuleDestroy() {
    this.redisClient.quit(); // إغلاق الاتصال عند تدمير الوحدة
    this.publisher.quit(); // إغلاق الاتصال عند تدمير الوحدة
    this.subscriber.quit(); // إغلاق الاتصال عند تدمير الوحدة
  }

  async publish(channel: string, message: string): Promise<number> {
    return this.publisher.publish(channel, message);
  }

  async subscribe(
    channel: string,
    callback: (message: string) => void,
  ): Promise<void> {
    if (channel) {
      await this.subscriber.subscribe(channel);
      this.subscriber.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          callback(message);
        }
      });
    }
  }
  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(channel);
    } catch (error) {
      throw error;
    }
  }
  pipeline() {
    const pipeline = this.redisClient.pipeline();
    return {
      set: (key: string, value: any, ttl?: number) => {
        const stringValue = JSON.stringify(value);
        if (ttl) {
          pipeline.setex(key, ttl, stringValue);
        } else {
          pipeline.set(key, stringValue);
        }
        return pipeline;
      },
      get: (key: string) => {
        pipeline.get(key);
        return pipeline;
      },
      del: (key: string) => {
        pipeline.del(key);
        return pipeline;
      },
      exec: async () => {
        return await pipeline.exec();
      },
    };
  }

  // دالة لتخزين البيانات بأنواع مختلفة (أرقام، كائنات، سلاسل نصية، إلخ)
  async set(key: string, value: any, ttl?: number): Promise<'OK'> {
    value = typeof value === 'object' ? JSON.stringify(value) : value;

    if (ttl) {
      return this.redisClient.set(key, value, 'EX', ttl);
    }

    return this.redisClient.set(key, value);
  }

  async get(key: string): Promise<any> {
    const value = (await this.redisClient.get(key)) as any;
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.redisClient.keys(pattern);
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.redisClient.exists(key);
  }

  async setex(key: string, ttl: number, value: any): Promise<void> {
    await this.redisClient.setex(key, ttl, value);
  }

  async hset(key: string, field: string, value: any): Promise<number> {
    value = typeof value === 'object' ? JSON.stringify(value) : value;
    return this.redisClient.hset(key, field, value);
  }

  async increment(key: string): Promise<number> {
    return this.redisClient.incr(key);
  }

  async hget(key: string, field: string): Promise<any> {
    const value = (await this.redisClient.hget(key, field)) as any;
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  async hgetall(key: string): Promise<Record<string, any>> {
    const data = await this.redisClient.hgetall(key);
    const result = {};
    for (const [field, value] of Object.entries(data)) {
      try {
        result[field] = JSON.parse(value);
      } catch (e) {
        result[field] = value;
      }
    }
    return result;
  }

  // طرق للتعامل مع القوائم
  async lpush(key: string, ...values: any[]): Promise<number> {
    const stringValues = values.map((v) =>
      typeof v === 'object' ? JSON.stringify(v) : v,
    );
    return this.redisClient.lpush(key, ...stringValues);
  }

  async rpush(key: string, ...values: any[]): Promise<number> {
    const stringValues = values.map((v) =>
      typeof v === 'object' ? JSON.stringify(v) : v,
    );
    return this.redisClient.rpush(key, ...stringValues);
  }

  async lrange(key: string, start: number, stop: number): Promise<any[]> {
    const values = await this.redisClient.lrange(key, start, stop);
    return values.map((v) => {
      try {
        return JSON.parse(v);
      } catch (e) {
        return v;
      }
    });
  }

  // طرق للتعامل مع المجموعات
  async sadd(key: string, ...members: any[]): Promise<number> {
    const stringMembers = members.map((m) =>
      typeof m === 'object' ? JSON.stringify(m) : m,
    );
    return this.redisClient.sadd(key, ...stringMembers);
  }

  async smembers(key: string): Promise<any[]> {
    const members = await this.redisClient.smembers(key);
    return members.map((m) => {
      try {
        return JSON.parse(m);
      } catch (e) {
        return m;
      }
    });
  }

  // طرق للتعامل مع المجموعات المرتبة
  async zadd(key: string, score: number, member: any): Promise<number> {
    member = typeof member === 'object' ? JSON.stringify(member) : member;
    return this.redisClient.zadd(key, score, member);
  }

  async zrange(
    key: string,
    start: number,
    stop: number,
    withScores = false,
  ): Promise<any> {
    const range = await this.redisClient.zrangebyscore(
      key,
      start,
      stop,
      'WITHSCORES',
    );
    if (!withScores) {
      return range.map((m) => {
        try {
          return JSON.parse(m);
        } catch (e) {
          return m;
        }
      });
    }

    const result = [] as any;
    for (let i = 0; i < range.length; i += 2) {
      let value;
      try {
        value = JSON.parse(range[i]);
      } catch (e) {
        value = range[i];
      }
      result.push({ value, score: parseFloat(range[i + 1]) });
    }
    return result;
  }
}
