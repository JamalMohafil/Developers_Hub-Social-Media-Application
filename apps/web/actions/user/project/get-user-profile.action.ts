"use server";
import { BACKEND_URL } from "@/lib/constants";
import { getSession } from "@/lib/session";
import { ProfileType } from "@/lib/type";

export const getUserProfile = async (
  id: string
): Promise<ProfileType | any> => {
  const session = await getSession();
  
    const res = await fetch(`${BACKEND_URL}/users/profile/${id}`, {
      cache: "no-store", // منع التخزين المؤقت
      next: { revalidate: 0 }, // إعادة التحقق في كل طلب
      headers: {
        Authorization: `${session?.accessToken && session?.user.id  && `Bearer ${session?.accessToken}`}`,
      },
    });
    const data = await res.json();
     return data;
 
};
