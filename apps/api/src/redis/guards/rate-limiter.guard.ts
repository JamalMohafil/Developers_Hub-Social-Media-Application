import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterService } from '../services/rate-limiter.service';

@Injectable()
export class RateLimiterGuard {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimiterService: RateLimiterService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const handler = context.getHandler();
    const hasRateLimiter = this.reflector.get('rateLimiter', handler);

    if (hasRateLimiter) {
      const request = context.switchToHttp().getRequest();
      const { prefix, limit, ttl } = hasRateLimiter;
      const ip = request.headers['x-forwarded-for'];

      await this.rateLimiterService.rateLimit(`${prefix}:${ip}`, limit, ttl);
    }

    return true;
  }
}
