import { AddProjectForm } from "@/components/user/projects/AddProjectForm";
import { getSession } from "@/lib/session";
import { SessionType } from "@/lib/type";


export default async function AddProjectPage() {
  const session = (await getSession()) as SessionType | null;
  return (
    <div className="container max-w-3xl mx-auto py-10 mt-12">
      <h1 className="text-3xl font-bold mb-6">Add New Project</h1>
      <AddProjectForm session={session} />
    </div>
  );
}
