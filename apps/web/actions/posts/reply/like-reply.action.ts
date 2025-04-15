"use server";
import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";

export const likeReplyAction = async (replyId: string) => {
  try {
    const res = await authFetch(`${BACKEND_URL}/post/like/replies/${replyId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
       },
     }); 
    const data = await res.json();
    console.log(data);
    return data;
  } catch (e: any) {
    console.error(`❌ Failed to like post: ${e}`); // Log the error message to the console
    return e;
  }
};
