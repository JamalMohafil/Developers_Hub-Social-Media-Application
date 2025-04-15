"use server";
import { BACKEND_URL } from "../../lib/constants";
import { PasswordResetSchema, ResetPasswordSchema } from "../../lib/type";

export async function resetPasswordAction(
  prevState: any,
  formData: FormData
): Promise<any> {
  // حالة التحميل قبل التحقق
  const pending = true;

  try {
    // استخراج البيانات من النموذج
    const rawFormData = {
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      token: formData.get("token") as string,
    };

    // التحقق من البيانات
    const validationResult = PasswordResetSchema.safeParse(rawFormData);
     console.log(rawFormData);
    if (!validationResult.success) {
      // حالة فشل التحقق
      return {
        pending: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // استدعاء API لإعادة تعيين كلمة المرور
    const response = await fetch(
      `${BACKEND_URL}/auth/reset-password?token=${validationResult.data.token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword: validationResult.data.password }),
        cache: "no-store",
      }
    );
     // التحقق من استجابة الخادم
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        pending: false,
        message: errorData?.message || "Failed to reset password",
      };
    }

    // النجاح وإعادة التوجيه
    return { success: true, pending: false };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      pending: false,
      message: "Failed to reset password",
    };
  }
}

// طلب إعادة تعيين كلمة المرور
export async function resetPasswordRequestAction(
  formData: FormData,
  prevState: any
) {
  try {
    // حالة التحميل
    const pending = true;

    // تحويل البيانات واستخراج البريد الإلكتروني
    const formDataObject = Object.fromEntries(formData);
    const result = ResetPasswordSchema.safeParse(formDataObject);

    // التحقق من صحة البيانات
    if (!result.success) {
      return {
        pending: false,
        errors: result.error.flatten().fieldErrors,
      };
    }

    const email = result.data.email;

    // استدعاء API لطلب إعادة تعيين كلمة المرور
    const response = await fetch(`${BACKEND_URL}/auth/reset-password-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });

    // التحقق من استجابة الخادم
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        pending: false,
        message: errorData?.message || "Failed to send password reset request",
      };
    }

    // النجاح
    return {
      success: true,
      pending: false,
    };
  } catch (error) {
    console.error("Reset password request error:", error);
    return {
      pending: false,
      message: "Failed to send password reset request",
    };
  }
}
