"use server";
import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";
import { getSession } from "@/lib/session";
import { Project, SkillType } from "@/lib/type";
import { revalidateTag } from "next/cache";

export const createProjectAction = async (
  formData: FormData
): Promise<{ data: Project | null; error: string | undefined } | null> => {
  try {
    const session = await getSession();
    const res = await authFetch(`${BACKEND_URL}/users/projects`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    revalidateTag(`projects-${session?.user.profileId}`);
    revalidateTag("projects");

    if (!res.ok) {
      return {
        data: null,
        error: data?.message || "حدث خطأ في إنشاء المشروع.",
      };
    }

    return { data, error: undefined };
  } catch (e: any) {
    console.error(`❌ Failed to create project: ${e}`);
    return { data: null, error: e.message || "حدث خطأ غير متوقع" };
  }
};
