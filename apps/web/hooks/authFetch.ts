"use server";
import { getSession } from "@/lib/session";

export const authFetch = async (
  url: string | URL,
  options: any = {}
): Promise<any> => {
  const session = await getSession();

  // التأكد من وجود توكن الوصول
  if (session?.accessToken) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${session.accessToken}`,
    };
  }

  try {
    const res = await fetch(url.toString(), options);
      // في حالة عدم التخويل
    if (res.status === 401 && !res.ok) {
      throw new Error("UNAUTHORIZED"); // 🔥 استبدل redirect بخطأ
    }
    return res;
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.log(e.message);
      throw e.message;
    } else {
      throw new Error("AUTH_FETCH_ERROR"); // 🔥 استبدل redirect بخطأ
    }
  }
};
