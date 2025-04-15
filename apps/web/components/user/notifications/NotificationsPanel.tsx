import { getAllNotifications } from "@/actions/user/notifications/get-all-notifications.action";
import { markAllNotificationsAsRead } from "@/actions/user/notifications/mark-all-notifications-read.action";
import { BACKEND_URL } from "@/lib/constants";
import { SessionType, Notification } from "@/lib/type";
import { Bell, Check, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import NotificationItem from "./NotificationItem";
import { toast } from "react-toastify";

type NotificationsPanelProps = {
  onClose: () => void;
  updateCount: any;
  session: SessionType;
};

export const NotificationsPanel = ({
  onClose,
  updateCount,
  session,
}: NotificationsPanelProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markAsReadLoading, setMarkAsReadLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const limit = 3;

  // إضافة معالج لإغلاق اللوحة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    // إضافة المستمع للنقرات خارج اللوحة
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // إزالة المستمع عند تفكيك المكون
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications(1);

    // Connect to WebSocket for real-time updates
    if (session?.user?.id) {
      const socket = io(`${BACKEND_URL}/notifications`, {
        query: { userId: session.user.id },
      });

      socket.on("notifications", (newNotification: Notification) => {
        setNotifications((prev) => [newNotification, ...prev]);
        // تحديث العدد عند استلام إشعار جديد
        updateCount((prevCount: number) => prevCount + 1);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [session?.user?.id, updateCount]);

  // دالة لجلب الإشعارات
  const fetchNotifications = async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const data = await getAllNotifications(pageNum, limit);

      if (data && data.length > 0) {
        if (pageNum === 1) {
          setNotifications(data);
        } else {
          setNotifications((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === limit);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreNotifications = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkAsReadLoading(true);
    try {
      const res = await markAllNotificationsAsRead();

      if (
        res &&
        res.message === "All notifications are already marked as read."
      ) {
        return toast.dark(res.message);
      } else if (!res) {
        return toast.dark("Failed to mark all notifications as read");
      }

      // Update all notifications to read status in UI
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      toast.dark("All notifications marked as read");
      // Update the notification count to 0
      updateCount(0);
    } catch (error) {
      toast.dark("Error marking all notifications as read");
      console.error("Error marking all notifications as read:", error);
    } finally {
      setMarkAsReadLoading(false);
    }
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-md shadow-lg z-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <div className="flex gap-2">
          <button
            disabled={markAsReadLoading}
            onClick={handleMarkAllAsRead}
            className={`text-xs cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded-md flex items-center gap-1
               ${markAsReadLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Check className="h-3 w-3" /> Mark all as read
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : notifications.length > 0 ? (
          <div>
            {notifications.map((notification: Notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}

            {hasMore && (
              <div className="p-2 text-center">
                <button
                  onClick={loadMoreNotifications}
                  disabled={loadingMore}
                  className="text-sm text-emerald-500 hover:text-emerald-400 p-2"
                >
                  {loadingMore ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-emerald-500 mr-2"></div>
                      loading...
                    </span>
                  ) : (
                    "load more"
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Bell className="h-12 w-12 text-slate-500 mb-2" />
            <p className="text-slate-400">No notifications found </p>
          </div>
        )}
      </div>
    </div>
  );
};
