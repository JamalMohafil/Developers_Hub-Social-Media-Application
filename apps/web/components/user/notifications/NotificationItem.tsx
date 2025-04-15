import { Notification, NotificationType } from "@/lib/type";
import { AlertCircle, Heart, MessageSquare, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  // Base notification styles
  const baseClasses = `p-4 border-b flex ${
    notification.isRead ? "bg-slate-900" : "bg-slate-800"
  } hover:bg-slate-700 transition-colors`;

  // تحديد أيقونة ولون خلفية الأيقونة حسب نوع الإشعار
  const getIconConfig = (type: NotificationType) => {
    switch (type) {
      case NotificationType.FOLLOW:
        return {
          icon: <UserPlus className="h-5 w-5 text-white" />,
          bgColor: "bg-emerald-900",
        };
      case NotificationType.LIKE:
        return {
          icon: <Heart className="h-5 w-5 text-white" />,
          bgColor: "bg-red-900",
        };
      case NotificationType.COMMENT:
        return {
          icon: <MessageSquare className="h-5 w-5 text-white" />,
          bgColor: "bg-blue-900",
        };
      case NotificationType.MESSAGE:
        return {
          icon: <MessageSquare className="h-5 w-5 text-white" />,
          bgColor: "bg-purple-900",
        };
      case NotificationType.SYSTEM:
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-white" />,
          bgColor: "bg-slate-700",
        };
    }
  };

  // إعداد الرابط حسب نوع الإشعار
  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case NotificationType.FOLLOW:
        const { senderId } = notification.metadata || { senderId: "" };
        return `/profile/${senderId}`;
      case NotificationType.MESSAGE:
        return notification.link || "/messages";
      default:
        return notification.link || "#";
    }
  };

  const { icon, bgColor } = getIconConfig(notification.type);
  const link = getNotificationLink(notification);

  // استخراج اسم المرسل من البيانات الوصفية
  const senderName = notification.metadata?.senderName || "User";
  const senderId = notification.metadata?.senderId || "/";

  // إعداد المكون
  const NotificationContent = () => (
    <div className="flex items-center">
      {notification.imageUrl ? (
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
          <Image
            src={notification.imageUrl}
            alt={senderName}
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
      ) : notification.type === NotificationType.COMMENT ? (
        <Link
          href={notification.link!}
          className={`w-10 h-10 ${bgColor} rounded-full mr-3 flex items-center justify-center`}
        >
          {icon}
        </Link>
      ) : (
        <div
          className={`w-10 h-10 ${bgColor} rounded-full mr-3 flex items-center justify-center`}
        >
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm">
          {notification.type === NotificationType.COMMENT ||
          notification.type === NotificationType.LIKE ? (
            <span>
              <Link
                href={`${senderId ? `/profile/${senderId}` : "#"}`}
                className="font-bold"
              >
                {senderName}{" "}
              </Link>
              <Link href={notification.link || "#"}>
              {notification.message}
              </Link>
            </span>
          ) : (
            notification.message
          )}
        </p>
        <span className="text-xs text-slate-400">{timeAgo}</span>
      </div>
    </div>
  );

  // إذا كان إشعار النظام، لا يحتاج إلى رابط
  if (
    notification.type === NotificationType.SYSTEM ||
    notification.type === NotificationType.COMMENT ||
    notification.type === NotificationType.LIKE
  ) {
    return (
      <div className={baseClasses}>
        <NotificationContent />
      </div>
    );
  }

  // لباقي أنواع الإشعارات، استخدم رابط
  return (
    <Link href={link} className={baseClasses}>
      <NotificationContent />
    </Link>
  );
};

export default NotificationItem;
