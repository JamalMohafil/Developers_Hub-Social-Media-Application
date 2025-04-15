'use server';
import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";
import { revalidatePath } from "next/cache";

// Fixed followAction function that properly handles the Response object
export const unfollowAction = async (
  profileId: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await authFetch(
      `${BACKEND_URL}/users/unfollow/${profileId}`,
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
        errorMessage = errorData.message || "Failed to unFollow user";
      } catch {
        // If not valid JSON, use the raw text
        errorMessage = errorText || "Failed to unFollow user";
      }

      throw new Error(errorMessage);
    }

    revalidatePath(`/profile/${profileId}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to unFollow user:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};
