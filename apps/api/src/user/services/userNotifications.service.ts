import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/services/redis.service';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class UserNotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
  ) {}

  async getUserNotificationsCount(user: any) {
    return this.prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });
  }
  async getUserNotifications(user: any, limit: number, page: number) {
    const skip = (page - 1) * limit;
    return await this.prisma.notification.findMany({
      where: { userId: user.id },
      skip: skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async markAllNotificationsAsRead(user: any) {
    const unreadNotifications = await this.prisma.notification.findMany({
      where: { userId: user.id, isRead: false },
    });

    // 2. إذا لم توجد إشعارات غير مقروءة، ارجع بخطأ
    if (unreadNotifications.length === 0) {
      throw new HttpException(
        'All notifications are already marked as read.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 3. تحديث حالة الإشعارات
    const result = await this.prisma.notification.updateMany({
      where: { userId: user.id },
      data: { isRead: true },
    });

    return result;
  }
}
