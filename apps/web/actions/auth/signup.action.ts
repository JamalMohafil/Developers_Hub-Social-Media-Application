"use server";
import { BACKEND_URL } from "../../lib/constants";
import { createSession } from "../../lib/session";
import { FormStateType, SignupFormSchema } from "../../lib/type";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function signUp(
  state: FormStateType,
  formData: FormData
): Promise<FormStateType> {
  // Convert FormData to a plain object for validation
  const formDataObject = Object.fromEntries(formData);

  // Validate the form data using Zod schema
  const validationResult = SignupFormSchema.safeParse(formDataObject);

  // If validation fails, return the field errors
  if (!validationResult.success) {
    return {
      error: validationResult.error.flatten().fieldErrors,
      data: formDataObject,
    };
  }

  try {
    // Send the validated data to the backend
    const response = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validationResult.data),
    });

    // Handle the response from the backend
    if (!response.ok) {
      // Handle specific error cases
      const errorMessage =
        response.status === 401
          ? "The user already exists!"
          : response.status === 400
            ? "Username is already taken"
            : "An error occurred during sign-up. Please try again.";
      return {
        message: errorMessage,
        data: formDataObject,
      };
    }
    const authData = await response.json();
    // استدعاء معلومات المستخدم الكاملة من الـ API
    const userInfoResponse = await fetch(`${BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authData.accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      return {
        message: "Failed to fetch user information.",
        data: formDataObject,
      };
    }

    const userInfo = await userInfoResponse.json();

    // إنشاء جلسة مع معلومات المستخدم الكاملة
    await createSession({
      user: userInfo, // استخدام كامل بيانات المستخدم من الـ API
      accessToken: authData.accessToken,
      // refreshToken: authData.refreshToken,
    });
  } catch (error) {
    // Handle unexpected errors (e.g., network issues)
    console.error("Sign-up failed:", error);
    return {
      message: "An unexpected error occurred. Please try again later.",
      data: formDataObject,
    };
  }
}

// This technique ensures redirect is called after all other processing
export async function signUpAction(
  state: FormStateType,
  formData: FormData
): Promise<FormStateType> {
  const result = await signUp(state, formData);

  if (!result?.error && !result?.message) {
    // Redirect only happens if the signup was successful
    redirect("/");
  }

  return result;
}
