import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { NotificationData } from './types/notification.interface';
import { NotificationType } from '@prisma/client';
import { RedisService } from 'src/redis/services/redis.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Logger, OnModuleInit, Inject, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'notifications',
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
})
@Injectable()
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationGateway.name);
  private connectedClients: Map<string, string[]> = new Map();

  // حماية ضد الاشتراك المتكرر
  private isRedisSubscribed = false;

  // تخزين وقت آخر إشعار لكل مستخدم للتحقق من التكرار
  private lastNotificationTimestamps: Map<string, number> = new Map();

  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    // منع الاشتراك المتكرر
    if (!this.isRedisSubscribed) {
      await this.subscribeToNotificationsChannel();
      this.isRedisSubscribed = true;
      this.logger.log(
        'Notification Gateway initialized and Redis subscription active',
      );
    }
  }

  async subscribeToNotificationsChannel() {
    try {
      // إلغاء أي اشتراكات سابقة أولاً
      await this.redisService.unsubscribe('notifications');

      // ثم الاشتراك مرة واحدة فقط
      await this.redisService.subscribe('notifications', (message) => {
        try {
          const notification = JSON.parse(message);

          // تطبيق منع التكرار استناداً إلى معرف المستخدم والوقت
          if (this.isRecentDuplicate(notification)) {
            this.logger.debug(
              `Prevented duplicate notification for user ${notification.userId}`,
            );
            return;
          }

          // إرسال الإشعار مرة واحدة فقط
          this.broadcastNotification(notification);
        } catch (error) {
          this.logger.error('Error processing notification message', error);
        }
      });
      this.logger.log('Successfully subscribed to Redis notification channel');
    } catch (e) {
      this.logger.error('Failed to subscribe to Redis notification channel', e);
    }
  }

  // منع التكرار باستخدام التوقيت والمعرف
  private isRecentDuplicate(notification: any): boolean {
    if (!notification || !notification.userId) return false;

    const now = Date.now();
    const lastTimestamp =
      this.lastNotificationTimestamps.get(notification.userId) || 0;

    // اعتبر الإشعارات التي تصل خلال 100 مللي ثانية كمكررات (يمكن تعديل هذه القيمة)
    const isDuplicate = now - lastTimestamp < 100;

    // تحديث آخر وقت للإشعار
    this.lastNotificationTimestamps.set(notification.userId, now);

    return isDuplicate;
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      this.logger.warn(`Client connected without userId: ${client.id}`);
      client.disconnect();
      return;
    }

    client.join(userId);

    if (!this.connectedClients.has(userId)) {
      this.connectedClients.set(userId, []);
    }
    this.connectedClients.get(userId)?.push(client.id);

    this.logger.log(`Client connected: ${client.id} for User ID: ${userId}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.connectedClients.forEach((clientIds, userId) => {
      const index = clientIds.indexOf(client.id);
      if (index !== -1) {
        clientIds.splice(index, 1);
        if (clientIds.length === 0) {
          this.connectedClients.delete(userId);
        }
      }
    });
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // احتفظ بهذا للتوافق مع العملاء الحاليين
  @SubscribeMessage('subscribe_notifications')
  handleSubscription(@ConnectedSocket() client: Socket, payload: any) {
    const userId = payload?.userId;
    if (userId) {
      // المستخدم منضم بالفعل من handleConnection لا حاجة للانضمام مرة أخرى
      this.logger.debug(
        `Client ${client.id} explicit subscription acknowledged`,
      );
      return { success: true };
    }
    return { success: false, message: 'User ID is required' };
  }

  async notifyUser(data: NotificationData) {
    try {
      this.logger.debug(`Creating notification for user ${data.userId}`);

      // إنشاء الإشعار في قاعدة البيانات
      const notification = await this.prisma.notification.create({
        data: {
          type: data.type,
          message: data.message,
          userId: data.userId,
          imageUrl: data.imageUrl,
          link: data.link,
          metadata: data?.metaData || {},
        },
      });

      // إضافة قيمة تساعد على التمييز بين الإشعارات
      const notificationData = {
        ...notification,
        timestamp: new Date().toISOString(),
        _publishTime: Date.now(), // للمساعدة في منع التكرار
      };

      this.logger.debug(`Publishing notification to Redis: ${notification.id}`);

      // استخدام وعد حتى يتم نشر الإشعار بالكامل قبل العودة
      await this.redisService.publish(
        'notifications',
        JSON.stringify(notificationData),
      );

      return notification;
    } catch (e) {
      this.logger.error(`Failed to create notification: ${e.message}`, e.stack);
      throw e;
    }
  }

  private broadcastNotification(notification: any) {
    try {
      if (!notification || !notification.userId) {
        this.logger.warn('Invalid notification data received');
        return;
      }

      this.logger.debug(
        `Broadcasting notification to user ${notification.userId} at ${new Date().toISOString()}`,
      );

      // إرسال الإشعار مرة واحدة فقط
      this.server.to(notification.userId).emit('notifications', notification);
    } catch (e) {
      this.logger.error(
        `Failed to broadcast notification: ${e.message}`,
        e.stack,
      );
    }
  }

  async sendTestNotification(userId: string) {
    const testNotification: NotificationData = {
      type: NotificationType.SYSTEM,
      message: `This is a test notification at ${new Date().toISOString()}`,
      userId,
      metaData: { test: true },
    };
    return this.notifyUser(testNotification);
  }
}
