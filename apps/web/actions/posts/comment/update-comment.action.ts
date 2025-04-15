"use server";

import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";

export const updateCommentAction = async (
  commentId: string,
  postId: string,
  content: string
) => {
  try {
    const res = await authFetch(
      `${BACKEND_URL}/post/${postId}/comments/${commentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }
    );
    const data = await res.json();
    console.log(data);
    return data;
  } catch (e) {
    console.log(e);
    return e;
  }
};
