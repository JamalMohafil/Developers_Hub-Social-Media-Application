"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Edit, Eye, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/type";
import { toast } from "react-toastify";
import { EditProjectModel } from "./EditProjectModel";
import { cn } from "@/lib/utils";
import { deleteProjectAction } from "@/actions/user/project/delete-project.action";

interface ProjectCardProps {
  project: Project;
  isOwnProfile: boolean;
  onProjectUpdated?: () => void;
  className?: string;
  imageClassName?:string;
}

export const ProjectCard = ({
  project,

  isOwnProfile,
  onProjectUpdated,
  className = "",
  imageClassName=""
}: ProjectCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm("Are you sure you want to delete this project?")) {
      try {
        setIsDeleting(true);

        // Replace with your actual delete project action
        const result = await deleteProjectAction(project.id);

        // Mock deletion for now
        if (result.status === 200) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          toast.success("Project deleted successfully");
          if (onProjectUpdated) {
            onProjectUpdated();
          }
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Failed to delete project");
        console.error(error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  return (
    <>
      <Link
        className={cn(
          "group relative  overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-sm transition-all hover:shadow-md",
          isDeleting
            ? "pointer-events-none opacity-50 cursor-not-allowed"
            : "cursor-pointer",
          className
        )}
        href={isDeleting ? "#" : `/projects/${project.id}`}
      >
        <div
          className={`relative h-40 w-full overflow-hidden ${imageClassName}`}
        >
          {project.image ? (
            <Image
              src={project.image || "/placeholder.svg"}
              alt={project.title}
              fill
              className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-700">
              <span className="text-3xl font-bold text-slate-600">
                {project.title.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">View Details</span>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="mb-2 text-xl line-clamp-2 font-semibold text-white group-hover:text-emerald-400">
            {project.title}
          </h3>
          <p className="mb-4 text-sm text-slate-300 line-clamp-2">
            {project.description.replace(/<[^>]*>/g, "")}
          </p>

          {isOwnProfile && (
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="outline"
                className="text-sm border-slate-700 hover:bg-slate-700"
                onClick={handleEditClick}
                disabled={isDeleting}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                className="text-sm bg-red-500/40 hover:bg-red-500/80 text-white"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          )}

          {project.skills && project.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full bg-emerald-900/50 px-3 py-1 text-xs font-medium text-emerald-300"
                >
                  {skill.name}
                </span>
              ))}
              {project.skills.length > 3 && (
                <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
                  +{project.skills.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {isEditModalOpen && (
        <EditProjectModel
          project={project}
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          closePanel={closeEditModal}
          onProjectUpdated={onProjectUpdated}
        />
      )}
    </>
  );
};
