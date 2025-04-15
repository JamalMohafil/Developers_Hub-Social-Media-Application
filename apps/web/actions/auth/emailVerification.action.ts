"use server";

import { authFetch } from "../../hooks/authFetch";
import { BACKEND_URL } from "../../lib/constants";
import { getSession, refreshUserSession } from "../../lib/session";

// Server action to send OTP
export async function sendOTP() {
  const session = await getSession();

  // Verificar si el usuario está autenticado
  if (!session || !session.user || !session.user.id) {
    throw new Error("User not authenticated");
  }

  try {
    // Usar fetch directamente para depurar si authFetch está causando problemas
    const response = await fetch(`${BACKEND_URL}/auth/send-otp`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        // Incluir token de autenticación si está disponible
        ...(session.accessToken
          ? { Authorization: `Bearer ${session.accessToken}` }
          : {}),
      },
      body: JSON.stringify({ userId: session.user.id }),
    });

    // Verificar que la respuesta existe antes de acceder a propiedades
    if (!response) {
      throw new Error("No response received from server");
    }

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to parse error response" }));
      throw new Error(
        errorData.message ||
          `Error ${response.status}: Failed to send verification code`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
}

// Server action to verify email with OTP
export async function verifyEmail(
  prevState: any,
  formData: FormData | { otp: string }
) {
  const session = await getSession();

  // Verificar si el usuario está autenticado
  if (!session || !session.user || !session.user.id) {
    return {
      message: "User not authenticated",
      success: false,
      error: true,
    };
  }
 
  try {
    let otp: string;
    if (formData instanceof FormData) {
      otp = formData.get("otp") as string;
    } else if (typeof formData === "object" && formData !== null) {
      otp = formData.otp;
    } else {
      return {
        message: "Invalid form data",
        success: false,
        error: true,
      };
    }
    // Usar fetch directamente para depurar
    const response = await fetch(`${BACKEND_URL}/auth/verify-email`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(session.accessToken
          ? { Authorization: `Bearer ${session.accessToken}` }
          : {}),
      },
      body: JSON.stringify({
        code: parseInt(otp),
        id: session.user.id,
      }),
    });

    if (!response) {
      return {
        message: "No response received from server",
        success: false,
        error: true,
      };
    }

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `Error ${response.status}` }));
      return {
        message: errorData.message || "Invalid verification code",
        success: false,
        error: true,
      };
    }

    // Si todo fue exitoso, actualizar la sesión del usuario
    await refreshUserSession();

    return {
      message: "Email verified successfully",
      success: true,
      error: false,
    };
  } catch (error) {
    console.error("Error verifying email:", error);
    console.log("Error verifying email:", error);
    return {
      message: "An error occurred during verification",
      success: false,
      error: true,
    };
  }
}
