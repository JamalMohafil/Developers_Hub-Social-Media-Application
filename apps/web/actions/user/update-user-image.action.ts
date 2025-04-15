"use server";

import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";
import { refreshUserSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateUserImageAction(imageBlob: Blob, userId: string) {
  try {
    // Create a File from the Blob
    const imageFile = new File([imageBlob], "profile.jpg", {
      type: "image/jpeg",
    });

    // Create form data
    const formData = new FormData();
    formData.append("image", imageFile);

    // Upload to backend
    const res = await authFetch(`${BACKEND_URL}/users/image`, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header, the browser will set it with correct boundary
    });
    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data?.message || "حدث خطأ في تحديث الصورة.",
      };
    }

    await refreshUserSession();
    revalidatePath(`/profile/${userId}`); // إعادة تحميل الصفحة بدون تخزين مؤقت
    return {
      success: true,
      data,
    };
  } catch (e: any) {
    console.error(`❌ Failed to update profile image: ${e}`);
    return {
      success: false,
      error: e.message || "حدث خطأ غير متوقع",
    };
  }
}
