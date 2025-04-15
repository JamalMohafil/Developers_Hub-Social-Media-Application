"use client";
import { PostsResponse } from "@/components/posts/PostsTab";
import { BACKEND_URL } from "@/lib/constants";
import { getSession } from "@/lib/session";

export async function fetchPosts(
  limit: number,
  page: number,
  sortOrder?: string | null,
  categoryId?: string | null,
  tagId?: string | null,
  p0?: { signal: AbortSignal }
) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const session = await getSession();
  // تحسين معالجة صفحات الترقيم والحد

  let url = `${BACKEND_URL}/post/posts?limit=${limit}&page=${page}&sortBy=${sortOrder || "desc"}`;

  if (categoryId) url += `&categoryId=${categoryId}`;
  if (tagId) url += `&tagId=${tagId}`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Authorization: `${session?.accessToken && session?.user.id && `Bearer ${session?.accessToken}`}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching posts: ${response.status}`);
    }
    const data = await response.json();
    return data ? data : [];
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
}
