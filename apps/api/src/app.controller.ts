import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';

import { Public } from './auth/decoratores/public.decorator';
import { RateLimiter } from './redis/decorators/rate-limiter.decorator';
import { RateLimiterService } from './redis/services/rate-limiter.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly rateLimiterService: RateLimiterService,
  ) {}

  @Get('/')
  @RateLimiter('user', 5, 3000)
  async getData2(@Req() request: Request) {
    // const ip = `dsa`; // Use x-forwarded-for if available, otherwise use request.ip

    // // تحديد مفتاح فريد للمستخدم أو الـ IP
    // const key = `rate_limit:${ip}`;

    // // تطبيق التحقق من عدد الطلبات
    // await this.rateLimiterService.rateLimit(key, 5, 1000);
    return this.appService.getData2();
  }
}
