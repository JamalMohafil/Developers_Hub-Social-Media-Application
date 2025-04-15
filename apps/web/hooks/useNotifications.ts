import { getNotificationCount } from "@/actions/user/notifications/get-notification-count.action";
import { createNotificationsSocket } from "@/app/socket";
import { SessionType } from "@/lib/type";
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const useNotifications = (session: SessionType) => {
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Socket Instance // Optional If You Want To Use It
  // const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        setIsLoading(true);
        const count = await getNotificationCount();
        setNotificationsCount(count || 0);
      } catch (error) {
        console.error("Error fetching notification count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotificationCount();

    // Set up WebSocket for real-time notifications
    if (session?.user?.id) {
      const socket = createNotificationsSocket(session.user.id);

      // Set Socket Instance // Optional For Future Use
      // setSocketInstance(socket);

      socket.on("connect", () => {
        console.log("Connected to notifications socket");
        socket.emit("subscribe_notifications", { userId: session.user.id });
      });

      socket.on("notifications", (data: any) => {
        console.log("🔔 Notification Received:", data);
        // Update notification count
        setNotificationsCount((prev) => prev + 1);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [session?.user?.id]);

  return { isLoading, notificationsCount, setNotificationsCount };
};

export default useNotifications;
