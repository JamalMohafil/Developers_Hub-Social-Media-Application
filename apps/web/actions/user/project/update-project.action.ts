"use server";
import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";
import { Project } from "@/lib/type";
import { revalidateTag } from "next/cache";

export const updateProjectAction = async (
  projectId: string,
  formData: FormData,
  profileId:string,
): Promise<{ data: Project | null; error: string | undefined } | null> => {
  try {
    const res = await authFetch(`${BACKEND_URL}/users/projects/${projectId}`, {
      method: "PUT",
      body: formData,
    });
    const data = await res.json()
    if(data){
      revalidateTag(`projects-[${projectId}]`)
      revalidateTag(`projects-${profileId}`);
    }
    if(!res.ok){
        return {
          data:null,
          error:"Unexpected error occured"
        }
    }

    return { data, error: undefined };
  } catch (e: any) {
    console.error(`❌ Failed to update project: ${e}`);
    return { data: null, error: e.message || "Unexpected error occured" };
  }
};
