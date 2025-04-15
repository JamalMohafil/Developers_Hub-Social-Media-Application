"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { projectFormSchema, SessionType, } from "@/lib/type";
import { RichTextEditor } from "@/components/utils/RichTextEditor";
import { toast } from "react-toastify";
import { ImagePreview } from "@/components/utils/ImagePreview";
import { VideoPreview } from "@/components/utils/VideoPreview";
 
 
  import ChooseSkills from "@/components/utils/ChooseSkills";
import useSkills from "@/hooks/useSkills";
import { createProjectAction } from "@/actions/user/project/create-project.action";

type ProjectFormValues = z.infer<typeof projectFormSchema>;

// نقوم بإنشاء useSkillsLogic مباشرة هنا
export function AddProjectForm({ session }: { session: SessionType | null }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>();
  // استخدام كود المهارات
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
  } = useSkills({ maxSkills: 10, initialSkills: [] });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      image: undefined,
      projectUrl: "",
      videoUrl: "",
      skills: [],
    },
  });

  // تحديث form عند تغيير المهارات
  useEffect(() => {
    form.setValue("skills", skills);
  }, [skills, form]);

  const watchVideoUrl = form.watch("videoUrl");
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    form.setValue("image", selectedFile);
    const imageUrl = URL.createObjectURL(selectedFile);
    setImagePreview(imageUrl);
  };
  async function onSubmit(data: ProjectFormValues) {
    try {
      setIsSubmitting(true);
      const zodResult = projectFormSchema.safeParse(data);
      if (!zodResult.success) {
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      if (data.image) {
        formData.append("image", data.image);
      }
      formData.append("projectUrl", data.projectUrl || "");
      formData.append("videoUrl", data.videoUrl || "");
      if (skills) {
        formData.append("skills", JSON.stringify(skills)); // مهم جدًا تحويل المصفوفات لنص
      }
      const result = await createProjectAction(formData);

      if (result && result.error === undefined) {
        // نجاح العملية
        toast.success("Project created successfully");

        // إعادة تعيين النموذج
        form.reset({
          title: "",
          description: "",
          image: undefined,
          projectUrl: "",
          videoUrl: "",
        });

        // إعادة تعيين المهارات إذا كنت تستخدم حالة المهارات المنفصلة
        setSkillQuery("");
        setSkills([]);
        clearImage();

        // التوجيه للصفحة التالية (يمكنك إلغاء التعليق)
        router.refresh();
        setTimeout(() => {
          router.push(`/profile/${session?.user?.id}#projects`);
        }, 200);
      }
    } catch (error: any) {
      // معالجة الأخطاء
      console.error("Error creating project:", error);

      // عرض رسالة خطأ مناسبة
      if (error?.message && typeof error.message === "string") {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong, try again later");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

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

  const isValidVideoUrl = (url: string) => {
    // التحقق الأساسي لمنصات الفيديو الشائعة
    return (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com") ||
      url.includes("facebook.com/watch") ||
      url.includes("drive.google.com")
    );
  };

  const clearImage = () => {
    form.setValue("image", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setImagePreview(null);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Enter Image"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageFileChange}
                      />
                      {field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={clearImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter a direct URL to an image
                  </FormDescription>
                  <FormMessage />
                  {imagePreview && <ImagePreview url={imagePreview} />}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project URL" {...field} />
                  </FormControl>
                  <FormDescription>Link to your live project</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                        value={field.value}
                        onChange={(e) => handleVideoUrlChange(e.target.value)}
                      />
                      {field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleVideoUrlChange("")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter a URL from YouTube, Vimeo, or Facebook
                  </FormDescription>
                  {videoError && (
                    <p className="text-sm font-medium text-destructive mt-2">
                      {videoError}
                    </p>
                  )}
                  <FormMessage />
                  {watchVideoUrl && !videoError && (
                    <VideoPreview url={watchVideoUrl} />
                  )}
                </FormItem>
              )}
            />

            {/* إضافة منطق لاختيار المهارات */}

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

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
