"use server";
import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";
import { getSession } from "@/lib/session";
import { Project, SkillType } from "@/lib/type";
import { revalidateTag } from "next/cache";

export const deleteProjectAction = async (
  projectId: string
): Promise<{ status: number; message: string }> => {
  try {
    const session = await getSession();

    const res = await authFetch(`${BACKEND_URL}/users/projects/${projectId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    revalidateTag(`projects-${session?.user.profileId}`);

    revalidateTag("projects");
    if (!res.ok) {
      return data;
    }

    return data;
  } catch (e: any) {
    console.error(`❌ Failed to delete project: ${e}`);
    return { status: 400, message: "Failed to delete the project" };
  }
};
