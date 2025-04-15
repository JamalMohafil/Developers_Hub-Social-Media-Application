"use server";
import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";
 
export const UpdatePostAction = async (postId: string, formData: FormData) => {
  try {
    const res = await authFetch(`${BACKEND_URL}/post/${postId}`, {
      method: "PUT",
      body: formData,
    });
    const data = await res.json();
    console.log(data);
    return data;
  } catch (e: any) {
    console.log(e);
    return e.message;
  }
};
