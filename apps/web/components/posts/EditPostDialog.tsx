"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  X,
  ImagePlus,
  Loader2,
  XCircle,
  Search,
  TagIcon,
  FolderIcon,
} from "lucide-react";
import Image from "next/image";
import {
  type Post,
  type Category,
  POST_STATUS,
  PostStatus,
  updatePostSchema,
} from "@/lib/type";
import { toast } from "react-toastify";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useTags from "@/hooks/useTags";
import useCategories from "@/hooks/useCategories";
import { RichTextEditor } from "../utils/RichTextEditor";
import { UpdatePostAction } from "@/actions/posts/update-post.action";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface EditPostDialogProps {
  post: Post;
  isOpen: boolean;
  setPost: React.Dispatch<React.SetStateAction<Post>>;
  onClose: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function EditPostDialog({
  post,
  setPost,
  isOpen,
  onClose,
  setIsOpen,
}: EditPostDialogProps) {
  const [title, setTitle] = useState(post.title);
  const [status, setStatus] = useState<PostStatus>(post.status);
  const [content, setContent] = useState(post.content);
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState(post.imageUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Use the useTags hook
  const {
    tags,
    setTags,
    tagsLoading,
    tagResults,
    tagSearchOpen,
    setTagSearchOpen,
    tagQuery,
    setTagQuery,
    addTag,
    removeTag,
    hasReachedMaxTags,
  } = useTags({
    initialTags: post.tags || [],
    maxTags: 10,
  });

  // Use the useCategories hook
  const {
    categories,
    setCategories,
    categoriesLoading,
    categoryResults,
    categorySearchOpen,
    setCategorySearchOpen,
    categoryQuery,
    setCategoryQuery,
    addCategory,
    removeCategory,
  } = useCategories({
    initialCategories: post.category ? [post.category] : [],
    maxCategories: 1, // Only one category can be selected
  });

  // Reset form when post changes
  useEffect(() => {
    if (isOpen) {
      setTitle(post.title);
      setContent(post.content);
      setPreviewImage(post.imageUrl || "");
      setTags(post.tags || []);

      setCategories(post.category ? [post.category] : []);
    }
  }, [isOpen, post, setTags, setCategories]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }

      document.addEventListener("keydown", handleEscKey);

      return () => {
        document.addEventListener("keydown", handleEscKey);
      };
    };
  }, [isOpen]);

  const closeModal = () => {
    setIsOpen(false);
    onClose();
  };
  const router = useRouter();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      const preview = URL.createObjectURL(file);
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.dark("Image size should be less than 5MB");
        return;
      }

      setIsUploading(true);
      setImage(file);
      setPreviewImage(preview || "/placeholder.svg");
      setIsUploading(false);
      toast.dark("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.dark("Failed to upload image");
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
     const zodResult = updatePostSchema.safeParse({
      content,
      status,
    });

    if (!zodResult.success && zodResult.error) {
      toast.dark(zodResult.error.issues[0]?.message);
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();

      if (image) {
        formData.append("image", image);
      } else if (previewImage === post.imageUrl) {
        formData.append("imageUrl", post.imageUrl as string);
      } else {
        formData.append("image", "");
      }
      if (categories && categories[0] && categories[0].id !== undefined) {
        formData.append("categoryId", categories[0].id);
      } else {
        formData.append("categoryId", "");
      }
      if (tags && tags.length > 0) {
        formData.append("tags", JSON.stringify(tags));
      }
      formData.append("title", title);
      formData.append("content", content);
      formData.append("status", status);
      const result = await UpdatePostAction(post.id, formData);
       if (result && result.status === 200) {
        toast.dark("Post updated successfully");
         setPost({
          user: post.user,
          isLiked: post.isLiked,
          isFollowing: post.isFollowing,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          ...result.post,
        });
        setTitle(result.post.title);
        setContent(result.post.content);
        setStatus(result.post.status);
        setCategories(result.post.category ? [result.post.category] : []);
        setTags(result.post.tags || []);
        router.refresh();
        closeModal();
      } else {
        toast.dark("Failed to update post");
      }
      // closeModal();
    } catch (error) {
      console.error("Error updating post:", error);
      toast.dark("Failed to update post");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 mt-12 overflow-hidden z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-card text-card-foreground border border-border rounded-lg shadow-lg"
      >
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <XCircle className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Edit Post</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                className="bg-background"
              />
            </div>
            <Select
              onValueChange={(status) => setStatus(status as PostStatus)}
              value={status}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose status ..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Post Status</SelectLabel>
                  {POST_STATUS.map((status: string, index: number) => (
                    <SelectItem key={index} value={status as PostStatus}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="grid gap-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <RichTextEditor
                noImage={true}
                onChange={setContent}
                value={content}
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="category"
                className="text-sm font-medium flex items-center gap-1"
              >
                <FolderIcon className="h-4 w-4" />
                Category
              </label>

              {/* Display selected category */}
              {/* Display selected category */}
              <div className="flex flex-wrap gap-2 mb-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Selected Category:
                    </span>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-primary text-sm border border-secondary/20"
                    >
                      <FolderIcon className="h-4 w-4 text-primary mr-1" />
                      {category.name}
                      <button
                        type="button"
                        onClick={() => removeCategory(category.id)}
                        className="h-5 w-5 cursor-pointer rounded-full flex items-center justify-center hover:bg-primary/20 ml-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Category search popover */}
              {categories.length === 0 && (
                <Popover
                  open={categorySearchOpen}
                  onOpenChange={setCategorySearchOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categorySearchOpen}
                      className="w-full justify-between"
                    >
                      Select a category
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search categories..."
                        value={categoryQuery}
                        onValueChange={setCategoryQuery}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {categoriesLoading ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Loading categories...
                            </div>
                          ) : (
                            <div className="py-6 text-center text-sm">
                              No categories found.
                            </div>
                          )}
                        </CommandEmpty>
                        {categoryResults.length > 0 && (
                          <CommandGroup heading="Available Categories">
                            {categoryResults.map((category) => (
                              <CommandItem
                                key={category.id}
                                value={category.name}
                                onSelect={() => {
                                  addCategory(category);
                                  setCategorySearchOpen(false);
                                }}
                              >
                                <FolderIcon className="mr-2 h-4 w-4" />
                                {category.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="image" className="text-sm font-medium">
                Image
              </label>
              <div className="flex flex-col items-center gap-4">
                <div className="w-full">
                  <label
                    htmlFor="image-upload"
                    className={`flex items-center justify-center gap-2 p-2 border border-dashed border-border rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
                      isUploading ? "opacity-50" : ""
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="h-5 w-5" />
                        <span>{image ? "Change image" : "Upload image"}</span>
                      </>
                    )}
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </div>
                {previewImage && (
                  <div className="relative h-60 w-full  rounded-md overflow-hidden border border-border">
                    <Image
                      src={previewImage ? previewImage : "/placeholder.svg"}
                      alt="Post image"
                      fill
                      className="object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0 h-5 w-5 rounded-full"
                      onClick={() => {
                        setImage(null);
                        setPreviewImage("");
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="tags"
                className="text-sm font-medium flex items-center gap-1"
              >
                <TagIcon className="h-4 w-4" />
                Tags{" "}
                {tags.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({tags.length}/10)
                  </span>
                )}
              </label>

              {/* Display selected tags */}
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id || tag.name}
                    variant="secondary"
                    className="flex items-center gap-1 bg-primary/10 text-primary"
                  >
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => removeTag(tag.id || "")}
                      className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-primary/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Tag search popover */}
              <Popover open={tagSearchOpen} onOpenChange={setTagSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={tagSearchOpen}
                    className="w-full justify-between"
                    disabled={hasReachedMaxTags}
                  >
                    {hasReachedMaxTags
                      ? "Maximum tags reached (10)"
                      : "Search for tags..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search tags..."
                      value={tagQuery}
                      onValueChange={setTagQuery}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {tagsLoading ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Searching...
                          </div>
                        ) : (
                          <div className="py-6 text-center text-sm">
                            No tags found.
                            {tagQuery.trim() && (
                              <Button
                                variant="link"
                                className="px-2 py-0 h-auto"
                                onClick={() => {
                                  addTag({ name: tagQuery.trim(), id: "" });
                                  setTagSearchOpen(false);
                                }}
                              >
                                Create "{tagQuery.trim()}"
                              </Button>
                            )}
                          </div>
                        )}
                      </CommandEmpty>
                      {tagResults.length > 0 && (
                        <CommandGroup heading="Available Tags">
                          {tagResults.map((tag) => (
                            <CommandItem
                              key={tag.id}
                              value={tag.name}
                              onSelect={() => {
                                addTag(tag);
                                setTagSearchOpen(false);
                              }}
                            >
                              <TagIcon className="mr-2 h-4 w-4" />
                              {tag.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={closeModal} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving || isUploading}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
