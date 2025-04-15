"use server";
import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await authFetch(
      `${BACKEND_URL}/users/notifications/mark-all-read`,
      {
        method: "POST",
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return { success: false };
  }
};
