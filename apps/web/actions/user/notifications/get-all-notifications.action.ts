"use server";
import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";

export const getAllNotifications = async (page = 1, limit = 10) => {
  try {
    const response = await authFetch(
      `${BACKEND_URL}/users/notifications?page=${page}&limit=${limit}`,
      {
        method: "GET",
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};
