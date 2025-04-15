"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight, Link } from "lucide-react";
import { Project } from "@/lib/type";
import { ProjectCard } from "./user/projects/ProjectCard";
import { getProjects } from "@/actions/user/project/get-projects.action";
import { ProjectCardSkeleton } from "./user/projects/ProjectsWrapper";
import { useRouter } from "next/navigation";
const FeaturedProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const result = await getProjects(3, 1);
        if (result) {
          setProjects(result.projects);
        } else {
          setProjects([]);
        }
      } catch (e) {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
            <p className="text-muted-foreground max-w-2xl">
              Explore some of the amazing projects our community members have
              built and shared.
            </p>
          </div>
          <Button
            onClick={() => router.push("/projects")}
            variant="outline"
            className="hidden md:flex border-accent text-accent hover:bg-accent/10"
          >
            View All Projects <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
          {loading
            ? [1, 2, 3].map((i) => <ProjectCardSkeleton key={i} />)
            : projects.map((project) => (
                <ProjectCard
                  imageClassName="h-68"
                  key={project.id}
                  project={project}
                  isOwnProfile={false}
                />
              ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button
            variant="outline"
            className="border-accent text-accent hover:bg-accent/10"
          >
            View All Projects <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
