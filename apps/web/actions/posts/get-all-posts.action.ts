"use server";
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
export const getUserPosts = async (
  userId: string,
  limit: number = 4,
  page: number = 0
): Promise<PostsResponse | null> => {
  const session = await getSession();
  try {
    const res = await fetch(
      `${BACKEND_URL}/post/user/${userId}?limit=${limit}&page=${page}`,
      {
        cache: "no-store",
        headers: {
          Authorization: `${session?.accessToken && session?.user.id && `Bearer ${session?.accessToken}`}`,
        },
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    return null; // إرجاع مصفوفة فارغة في حالة الخطأ
  }
};

export const getPostDetails = async (postId: string): Promise<any> => {
  const session = await getSession();
  try {
    const res = await fetch(`${BACKEND_URL}/post/getPost/${postId}`, {
      method: "GET",
      headers: {
        Authorization: `${session?.accessToken && session?.user.id && `Bearer ${session?.accessToken}`}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch post: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching post:", error);
    return []; // إرجاع مصفوفة فارغة في حالة الخطأ
  }
};
