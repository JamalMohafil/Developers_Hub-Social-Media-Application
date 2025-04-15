"use server";

import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";

export const getNotificationCount = async () => {
  try {
    const response = await authFetch(
      `${BACKEND_URL}/users/notifications/count`,
      {
        method: "GET",
      }
    );
     if(!response.ok){
      throw new Error(`Failed to fetch notifications count: ${response.status}`);
    }
    const data = await response.json();
     return data;
} catch (error) {
    console.error("Error fetching notifications count:", error);
  }
};
