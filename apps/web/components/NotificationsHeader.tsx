// components/notifications/NotificationsPanel.tsx
import React, { useState } from "react";
import { Bell } from "lucide-react";

import { SessionType } from "@/lib/type";
import { NotificationsPanel } from "./user/notifications/NotificationsPanel";
import useNotifications from "@/hooks/useNotifications";

// NotificationsHeader component
export const NotificationsHeader = ({ session }: { session: SessionType }) => {
  const [showPanel, setShowPanel] = useState(false);

  const { setNotificationsCount, notificationsCount, isLoading } =
    useNotifications(session);
  const togglePanel = () => {
    setShowPanel(!showPanel);
  };

  return (
    <div className="relative">
      <button
        onClick={togglePanel}
        className="p-2 rounded-full cursor-pointer hover:bg-slate-800 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {isLoading ? (
          <span className="absolute top-0 right-0 h-4 w-4 bg-slate-500 rounded-full text-xs flex items-center justify-center border-2 border-slate-900">
            <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
          </span>
        ) : (
          notificationsCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-emerald-500 rounded-full text-xs flex items-center justify-center border-2 border-slate-900">
              {notificationsCount > 9 ? "9+" : notificationsCount}
            </span>
          )
        )}
      </button>

      {showPanel && (
        <NotificationsPanel
          session={session}
          onClose={() => setShowPanel(false)}
          updateCount={setNotificationsCount}
        />
      )}
    </div>
  );
};

export default NotificationsHeader;
