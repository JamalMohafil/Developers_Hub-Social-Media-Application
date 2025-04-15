"use server";
import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";

// Fixed followAction function that properly handles the Response object
export const followAction = async (
  profileId: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await authFetch(
      `${BACKEND_URL}/users/follow/${profileId}`,
      {
        method: "POST",
      }
    );
     // // Check for success status
    if (!response.ok) {
      // Parse error response
      const errorText = await response.text();
      let errorMessage;

      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || "Failed to follow user";
      } catch {
        // If not valid JSON, use the raw text
        errorMessage = errorText || "Failed to follow user";
      }

      throw new Error(errorMessage);
    }

    // Don't try to parse the response if we don't need the data
    // Just return success without attempting to read the body

    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to follow user:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};
