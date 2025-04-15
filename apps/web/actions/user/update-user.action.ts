"use server";
import { authFetch } from "@/hooks/authFetch";
import { BACK_URL, BACKEND_URL } from "@/lib/constants";
import { refreshUserSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export const updateUserAction = async (userId: string, formData: any) => {
  try {
    const payload = structuredClone(formData);

    const response = await authFetch(`${BACKEND_URL}/users/profile/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log(payload);
    const data = await response.json();

    if (!response.ok) {
      // ترسل رسالة الخطأ مباشرة من الباك إند
      return {
        error: {
          message: data?.message || "حدث خطأ أثناء تحديث الملف الشخصي.",
        },
      };
    }

    await refreshUserSession();
    revalidatePath(`/profile/${userId}`); // إعادة تحميل الصفحة بدون تخزين مؤقت

    return data;
  } catch (error: any) {
    console.log("❌ فشل تحديث الملف الشخصي:", error);
    // إعادة رمي الخطأ بالرسالة الأصلية
    throw error;
  }
};

export const updateAllProducts = async (formData: Record<string, any>[]) => {
  const products = await authFetch(`${BACK_URL}/prooducts`, {
    method: "POST",
    body: JSON.stringify(formData),
  });
};
