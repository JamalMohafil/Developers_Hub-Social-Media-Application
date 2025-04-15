"use client";

import { io } from "socket.io-client";

export const createNotificationsSocket = (userId: string) => {
  const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications`, {
    query: { userId },
  });
  return socket;
};
