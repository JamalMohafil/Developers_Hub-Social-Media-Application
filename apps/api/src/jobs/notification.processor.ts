import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { NotificationData } from 'src/notification/types/notification.interface';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);
  constructor(private notificationGateway: NotificationGateway) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);

    try {
      const { data } = job;

      if (typeof data === 'object' && 'userId' in data && 'type' in data) {
        const notificationData = data as NotificationData;
        return await this.handleNotification(notificationData);
      } else {
        this.logger.warn(`Invalid notification data in job ${job.id}`);
        return { success: false, message: 'Invalid notification data' };
      }
    } catch (e) {
      this.logger.error(`Error processing ${job.id}`, e);
      throw e;
    }
  }

  async handleNotification(data: NotificationData) {
    this.logger.log(`Sending notification to user ${data.userId}`);

    try {
      const notification = await this.notificationGateway.notifyUser(data);
      return {
        success: true,
        message: 'Notification sent successfully',
        notificationId: notification.id,
      };
    } catch (e) {
      this.logger.error('Failed to send notification', e);
      return {
        success: false,
        message: 'Failed to send notification',
        error: e.message,
      };
    }
  }
}
