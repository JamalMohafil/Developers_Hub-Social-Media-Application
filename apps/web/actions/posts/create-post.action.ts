"use server";
import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";

export const CreatePostAction = async (formData: FormData) => {
  try {
    const res = await authFetch(`${BACKEND_URL}/post`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    console.log(data, "creates");
    return data;
  } catch (e: any) {
    console.log(e);
    return e.message;
  }
};
