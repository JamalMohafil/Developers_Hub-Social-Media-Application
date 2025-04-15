"use server";
import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";

export const DeletePostAction = async (postId: string) => {
  try {
    const res = await authFetch(`${BACKEND_URL}/post/${postId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return data;
  } catch (e: any) {
    console.log(e);
    throw e;
  }
};
