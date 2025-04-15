"use server";

import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";

export const updateReplyAction = async (
  postId: string,
  commentId: string,
  replyId: string,
  content: string
) => {
  try {
    console.log(postId, commentId);

    const res = await authFetch(
      `${BACKEND_URL}/post/${postId}/comments/${commentId}/replies/${replyId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }
    );
    const data = await res.json();
    console.log(res);
    console.log(data);
    return data;
  } catch (e) {
    console.log(e);
    return e;
  }
};
