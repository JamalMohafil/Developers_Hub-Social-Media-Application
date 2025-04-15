import { NotificationType } from '@prisma/client';

export interface NotificationData {
  id?: string;
  type: NotificationType;
  imageUrl?: string;
  link?: string;
  metaData: Record<string, any>;
  message: string;
  isRead?: boolean;
  userId: string;
}
