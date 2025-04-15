"use server";

import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";

export const deleteCommentAction = async (
  postId: string,
  commentId: string
) => {
  try {
    const res = await authFetch(
      `${BACKEND_URL}/post/${postId}/comments/${commentId}`,
      {
        method: "DELETE",
      }
    );
    const data = await res.json();

    return data;
  } catch (e) {
    return e;
  }
};
