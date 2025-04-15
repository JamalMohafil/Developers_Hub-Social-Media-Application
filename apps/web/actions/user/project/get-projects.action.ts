"use server";
import { ProjectsResponse } from "@/components/user/projects/ProjectsTab";
import { BACKEND_URL } from "@/lib/constants";
import { getSession } from "@/lib/session";
import { Project } from "@/lib/type";

export const getUserProjects = async (
  profileId: string,
  limit: number = 4,
  page: number = 0
): Promise<ProjectsResponse | null> => {
  try {
    const res = await fetch(
      `${BACKEND_URL}/users/projects/${profileId}?limit=${limit}&page=${page}`,
      {
        next:{tags:[`projects-${profileId}`],revalidate:360}
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch projects: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching projects:", error);
    return null; // إرجاع مصفوفة فارغة في حالة الخطأ
  }
};

export async function getProjects(
  limit: number,
  page: number,
  sortOrder?: string | null,
  skillId?: string | null
) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const session = await getSession();
  // تحسين معالجة صفحات الترقيم والحد
  console.log(sortOrder,'asdfgb')
  let url = `${BACKEND_URL}/users/projects?limit=${limit}&page=${page}&sortBy=${sortOrder || "desc"}`;

  if (skillId) url += `&skillId=${skillId}`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Authorization: `${session?.accessToken && session?.user.id && `Bearer ${session?.accessToken}`}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching posts: ${response.status}`);
    }
    const data = await response.json();
    console.log(data,'projectsData')
    return data ? data : [];
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
}

export const getProjectDetails = async (projectId: string): Promise<any> => {
  try {
    const res = await fetch(
      `${BACKEND_URL}/users/projects/project/${projectId}`,
      {
        next: { revalidate: 60, tags: [`project-${projectId}`] }, // ✅ كاش مؤقت لمدة 60 ثانية
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch projects: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching projects:", error);
    return []; // إرجاع مصفوفة فارغة في حالة الخطأ
  }
};
