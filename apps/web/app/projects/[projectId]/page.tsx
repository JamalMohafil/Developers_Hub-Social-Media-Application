import { notFound } from "next/navigation";

import type { ProfileType, Project, SkillType } from "@/lib/type";
import type { Metadata } from "next";
import ProjectHeroSection from "@/components/user/projects/ProjectHeroSection";
import ProjectContentSection from "@/components/user/projects/ProjectContentSection";
import ProjectSidebar from "@/components/user/projects/ProjectSidebar";
import { getProjectDetails } from "@/actions/user/project/get-projects.action";

type Props = {
  params: { projectId: string };
};

// Add generateMetadata function before the component
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const projectId = (await params).projectId;
  const projectData: any = await getProjectDetails(projectId);

  // Return 404 metadata if project not found
  if (!projectData || !projectData.project) {
    return {
      title: "Project Not Found",
      description: "The requested project could not be found.",
    };
  }

  const { project, profile } = projectData;

  // Extract skills as keywords
  const keywords = project.skills
    ? project.skills.map((skill: SkillType) => skill.name).join(", ")
    : "";

  // Create a clean description (strip HTML if present)
  const cleanDescription = project.description
    ? project.description.replace(/<[^>]*>?/gm, "").substring(0, 160)
    : `${project.title} - A project by ${profile.user?.name || "Unknown"}`;

  return {
    title: `${project.title} | ${profile.user.name}`,
    description: cleanDescription,
    keywords: [
      "project",
      profile.user?.name || "",
      ...keywords.split(", "),
    ].filter(Boolean),
    authors: [{ name: profile.user?.name || "Unknown" }],
    creator: profile.user?.name,
    publisher: profile.company || profile.user?.name || "Portfolio",
    openGraph: {
      title: project.title,
      description: cleanDescription,
      type: "article",
      publishedTime: project.createdAt,
      authors: [profile.user?.name || "Unknown"],
      images: [
        {
          url: project.imageUrl || "/placeholder.svg",
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: cleanDescription,
      images: [project.imageUrl || "/placeholder.svg"],
      creator: profile.user?.name || "Unknown",
    },
    alternates: {
      canonical: `/projects/${projectId}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    category: project.category || "Portfolio",
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"
    ),
  };
}
type ProjectDataType = {
  project: Project;
  profile: ProfileType;
  lastProjects: Project[];
} | null;
export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = (await params).projectId;
  const projectData: ProjectDataType | null =
    await getProjectDetails(projectId);

  if (!projectData || !projectData.project) {
    notFound();
  }

  const { project, profile, lastProjects } = projectData;

  // Format date
  const formattedDate = new Date(project.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="min-h-screen bg-gradient-to-b pt-12 bg-slate-950 pb-16">
      {/* Hero Section with animated background */}
      <ProjectHeroSection formattedDate={formattedDate} project={project} />

      <div className="container mx-auto mt-3 px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Main Content */}
          <ProjectContentSection project={project} />

          {/* Sidebar - Creator Profile */}
          <ProjectSidebar
            project={project}
            profile={profile}
            lastProjects={lastProjects}
          />
        </div>
      </div>
    </div>
  );
}
