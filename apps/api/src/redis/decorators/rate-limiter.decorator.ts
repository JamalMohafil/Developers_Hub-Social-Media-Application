import { SetMetadata } from '@nestjs/common';

export const RateLimiter = (prefix: string, limit: number, ttl: number) => {
  return SetMetadata('rateLimiter', { prefix, limit, ttl });
};
