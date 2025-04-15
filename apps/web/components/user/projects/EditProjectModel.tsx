"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { RichTextEditor } from "@/components/utils/RichTextEditor";
import { ImagePreview } from "@/components/utils/ImagePreview";
import { VideoPreview } from "@/components/utils/VideoPreview";
import Spinner from "@/components/utils/Spinner";
import { Project, projectEditSchema } from "@/lib/type";
import ChooseSkills from "@/components/utils/ChooseSkills";
import useSkills from "@/hooks/useSkills";
import { updateProjectAction } from "@/actions/user/project/update-project.action";

// Define the schema for project form validation

type ProjectEditFormValues = z.infer<typeof projectEditSchema>;

interface EditProjectModelProps {
  project: Project;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  closePanel: () => void;
  onProjectUpdated?: () => void;
}

export const EditProjectModel = ({
  project,
  isOpen,
  setIsOpen,
  closePanel,
  onProjectUpdated,
}: EditProjectModelProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    project.image || null
  );
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize skills logic with project's existing skills
  const {
    skills,
    setSkills,
    skillsLoading,
    skillResults,
    skillSearchOpen,
    setSkillSearchOpen,
    skillQuery,
    setSkillQuery,
    addSkill,
    removeSkill,
    hasReachedMaxSkills,
  } = useSkills({
    maxSkills: 10,
    initialSkills: project.skills || [],
  });

  // Initialize form with project data
  const form = useForm<ProjectEditFormValues>({
    resolver: zodResolver(projectEditSchema),
    defaultValues: {
      title: project.title || "",
      description: project.description || "",
      image: undefined,
      projectUrl: project.projectUrl || "",
      videoUrl: project.videoUrl || "",
      skills: project.skills || [],
    },
  });

  // Update form when skills change
  useEffect(() => {
    form.setValue("skills", skills);
  }, [skills, form]);

  // Watch video URL for validation
  const watchVideoUrl = form.watch("videoUrl");

  // Handle image file selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    form.setValue("image", selectedFile);
    const imageUrl = URL.createObjectURL(selectedFile);
    setImagePreview(imageUrl);
    setRemoveCurrentImage(false);
  };

  // Clear image selection
  const clearImage = () => {
    form.setValue("image", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setImagePreview(null);
    setRemoveCurrentImage(true);
  };

  // Validate video URL
  const handleVideoUrlChange = (url: string) => {
    if (url && !isValidVideoUrl(url)) {
      setVideoError(
        "This video URL cannot be previewed. Please use a YouTube, Drive, Vimeo, or Facebook video URL."
      );
    } else {
      setVideoError(null);
    }
    form.setValue("videoUrl", url);
  };

  // Check if video URL is valid
  const isValidVideoUrl = (url: string) => {
    return (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com") ||
      url.includes("facebook.com/watch") ||
      url.includes("drive.google.com")
    );
  };

  // Form submission handler
  const onSubmit = async (data: ProjectEditFormValues) => {
    try {
      setIsSubmitting(true);

      // Validate form data
      const zodResult = projectEditSchema.safeParse(data);
      if (!zodResult.success) {
        setIsSubmitting(false);
        return;
      }

      // Prepare form data for submission
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);

      // Handle image upload or removal
      if (data.image) {
        formData.append("image", data.image);
      }
      formData.append("projectUrl", data.projectUrl || "");
      formData.append("videoUrl", data.videoUrl || "");

      // Add skills to form data
      if (skills && skills.length > 0) {
        formData.append("skills", JSON.stringify(skills));
      }

      const result = await updateProjectAction(project.id, formData,project.profileId);

      if (result && !result?.error) {
        toast.success("Project updated successfully");
        closePanel();
        if (onProjectUpdated) {
          onProjectUpdated();
        }
      } else {
        toast.error(result?.error || "Failed to update project");
      }
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast.error(error?.message || "Something went wrong, try again later");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) closePanel();
        else setIsOpen(true);
      }}
    >
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Project Title
            </Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Enter project title"
              className="bg-slate-800 border-slate-700 focus:ring-emerald-500"
            />
            {form.formState.errors.title && (
              <p className="text-red-400 text-sm">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <RichTextEditor
              value={form.watch("description")}
              onChange={(value) => form.setValue("description", value)}
            />
            {form.formState.errors.description && (
              <p className="text-red-400 text-sm">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Project Image */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-white">
              Project Image
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="image"
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                className="bg-slate-800 border-slate-700 focus:ring-emerald-500"
              />
              {imagePreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearImage}
                  className="text-white hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-slate-400">
              Upload a new image or leave empty to keep the current one
            </p>
            {imagePreview && (
              <div className="relative h-48 w-full overflow-hidden rounded-md">
                <ImagePreview url={imagePreview} />
              </div>
            )}
          </div>

          {/* Project URL */}
          <div className="space-y-2">
            <Label htmlFor="projectUrl" className="text-white">
              Project URL
            </Label>
            <Input
              id="projectUrl"
              {...form.register("projectUrl")}
              placeholder="Enter project URL"
              className="bg-slate-800 border-slate-700 focus:ring-emerald-500"
            />
            {form.formState.errors.projectUrl && (
              <p className="text-red-400 text-sm">
                {form.formState.errors.projectUrl.message}
              </p>
            )}
            <p className="text-sm text-slate-400">
              Link to your live project (optional)
            </p>
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl" className="text-white">
              Video URL
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="videoUrl"
                value={watchVideoUrl || ""}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                className="bg-slate-800 border-slate-700 focus:ring-emerald-500"
              />
              {watchVideoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleVideoUrlChange("")}
                  className="text-white hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-slate-400">
              Enter a URL from YouTube, Vimeo, or Facebook (optional)
            </p>
            {videoError && (
              <p className="text-sm font-medium text-red-400 mt-2">
                {videoError}
              </p>
            )}
            {watchVideoUrl && !videoError && (
              <VideoPreview url={watchVideoUrl} />
            )}
          </div>

          {/* Skills Selection */}
          <div>

          <ChooseSkills
            addSkill={addSkill}
            errors={form.formState.errors}
            formData={form.getValues()}
            removeSkill={removeSkill}
            setSkillQuery={setSkillQuery}
            setSkillSearchOpen={setSkillSearchOpen}
            skillQuery={skillQuery}
            skillResults={skillResults}
            skillSearchOpen={skillSearchOpen}
            skillsLoading={skillsLoading}
          />

            </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closePanel}
              disabled={isSubmitting}
              className="border-slate-700 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
