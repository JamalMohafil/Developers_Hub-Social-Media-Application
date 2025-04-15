"use server";

import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";

export const deleteReplyAction = async (
  postId: string,
  commentId: string,
  replyId: string
) => {
  try {
    const res = await authFetch(
      `${BACKEND_URL}/post/${postId}/comments/${commentId}/replies/${replyId}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    return data;
  } catch (e: any) {
  
    return e.message;
  }
};
