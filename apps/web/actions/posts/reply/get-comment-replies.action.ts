"use server";

import { getSession } from "@/lib/session";

export async function getCommentRepliesAction(
  limit: number,
  page: number,
  commentId: string,
) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  // تحسين معالجة صفحات الترقيم والحد
  const session = await getSession();
  const url = `${BACKEND_URL}/post/${commentId}/replies?limit=${limit}&page=${page}`;


  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${session && session?.accessToken && `${session?.accessToken}`}`,
      },
    });
    console.log(response)
    if (!response.ok) {
      throw new Error(`Error fetching posts: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
}
