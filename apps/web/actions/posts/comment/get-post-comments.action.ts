"use server";

import { getSession } from "@/lib/session";

export async function getPostCommentsAction(
  limit: number,
  page: number,
  postId: string,
  sortOrder?: string | null
) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

  // تحسين معالجة صفحات الترقيم والحد
  const session = await getSession();
  const url = `${BACKEND_URL}/post/${postId}/comments?limit=${limit}&page=${page}&sortBy=${sortOrder}`;


  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${session && session?.accessToken && `${session?.accessToken}`}`,
      },
    });

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
