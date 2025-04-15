 
import BackgroundAnimation from "@/components/ui/background-animation";
import dynamic from "next/dynamic";
const ProjectsWrapper = dynamic(
  () => import("@/components/user/projects/ProjectsWrapper"),
  {
    ssr: true,
  }
);
export default async function ProjectsPage() {
  return (
    <>
      <BackgroundAnimation />
      <div className="container  mt-18 mx-auto px-4 py-8">
        <h1 className="text-4xl text-center font-bold mb-10">Projects</h1>
        <ProjectsWrapper />
      </div>
    </>
  );
}
