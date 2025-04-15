"use client";

import type React from "react";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  TagIcon,
  FolderIcon,
  X,
  Send,
  Smile,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(
  () =>
    import("@/components/utils/RichTextEditor").then(
      (mod) => mod.RichTextEditor
    ),
  { ssr: false }
);

import { useRouter } from "next/navigation";
import useTags from "@/hooks/useTags";
import useCategories from "@/hooks/useCategories";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CreatePostAction } from "@/actions/posts/create-post.action";
import {
  createPostSchema,
  POST_STATUS,
  PostStatus,
  type UserInfoType,
} from "@/lib/type";
import { ImageUploadButton } from "./ImageUploadButton";
import Spinner from "../utils/Spinner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import ImageByChar from "../utils/ImageByChar";

const containerVariants = {
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, staggerChildren: 0.1, delayChildren: 0.1 },
  },
  closed: {
    opacity: 0.8,
    scale: 0.98,
    y: 20,
    transition: { duration: 0.2, staggerChildren: 0.05, delayChildren: -1 },
  },
};

const itemVariants = {
  closed: {
    opacity: 0,
    y: -5,
    transition: { duration: 0.2 },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

interface CreatePostProps {
  user: UserInfoType;
  refreshPosts: () => void;
}

export default function CreatePost({ user, refreshPosts }: CreatePostProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<PostStatus>("PUBLISHED");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the useTags hook
  const {
    tags,
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
    initialTags: [],
    maxTags: 10,
  });

  // Use the useCategories hook
  const {
    categories,
    categoriesLoading,
    categoryResults,
    categorySearchOpen,
    setCategorySearchOpen,
    categoryQuery,
    setCategoryQuery,
    addCategory,
    removeCategory,
  } = useCategories({
    initialCategories: [],
    maxCategories: 1, // Only one category can be selected
  });

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
      setPreviewImage(preview);
      setIsUploading(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.dark("Failed to upload image");
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    const zodResult = createPostSchema.safeParse({
      content,
      status,
    });
     if (!zodResult.success && zodResult.error) {
      toast.dark(zodResult.error.issues[0]?.message);
      return;
    }
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      if (image) {
        formData.append("image", image);
      }

      if (categories && categories[0] && categories[0].id !== undefined) {
        formData.append("categoryId", categories[0].id);
      }

      if (tags && tags.length > 0) {
        formData.append("tags", JSON.stringify(tags));
      }

      formData.append("title", title);
      formData.append("content", content);
     
      const result = await CreatePostAction(formData);

      if (result && result.status === 201) {
        toast.dark("Post created successfully");
        refreshPosts();
        resetForm();
       } else {
        toast.dark("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.dark("Failed to create post | Server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setImage(null);
    setPreviewImage("");
    setIsExpanded(false);
    removeAllTags();
    removeAllCategories();
  };

  const removeAllTags = () => {
    tags.forEach((tag) => {
      removeTag(tag.id || "");
    });
  };

  const removeAllCategories = () => {
    categories.forEach((category) => {
      removeCategory(category.id);
    });
  };

  const onOpenChange = (open: boolean) => {
    if (user) {
      setIsExpanded(open);
    } else {
      toast.dark("Please login to create a post");
    }
  };
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card className="w-full max-w-2xl mx-auto mb-6  shadow-sm relative">
      <CardContent className="py-4 px-8  ">
        <div className="flex items-center gap-3 mb-0">
          {!isExpanded ? (
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user.image || "/placeholder-user.jpg"}
                alt={user.name || "User"}
              />
              <ImageByChar name={user.name as string} className="text-xl" isFallback={true}/>
            </Avatar>
          ) : (
            <motion.span
              onClick={() => setIsExpanded(false)}
              className="cursor-pointer absolute left-5 top-4 rounded-full bg-gray-100 dark:bg-gray-800 p-1 flex items-center justify-center"
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2 },
              }}
              whileTap={{
                scale: 0.9,
                transition: { type: "spring", stiffness: 400, damping: 17 },
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: { duration: 0.3 },
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0.2 },
              }}
            >
              <motion.div
                animate={isHovered ? { rotate: 90 } : { rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-5 w-5 text-gray-700 dark:text-gray-200" />
              </motion.div>
            </motion.span>
          )}
          <div className="flex-1">
            <Collapsible
              onAnimationEnd={() => fileInputRef.current?.focus()}
              open={isExpanded}
              onOpenChange={onOpenChange}
            >
              {isExpanded ? (
                <motion.div
                  animate={{ opacity: 1, height: "auto" }}
                  initial={{ opacity: 0, height: 48 }}
                  exit={{ opacity: 0, height: 48 }}
                  className="mt-4"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {" "}
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post title"
                    className=" bg-background"
                    onClick={(e) => e.stopPropagation()}
                  />
                </motion.div>
              ) : (
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start  text-muted-foreground h-12 text-base"
                    onClick={() => !isExpanded && setIsExpanded(true)}
                  >
                    What's on your mind?
                  </Button>
                </CollapsibleTrigger>
              )}

              <CollapsibleContent className="mt-4 space-y-4">
                <motion.div
                  className="mt-4 space-y-4"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={containerVariants}
                >
                  <motion.div variants={itemVariants}>
                    <Label className="text-sm mb-2">Post Status</Label>
                    <Select
                      value={status}
                      onValueChange={(status) =>
                        setStatus(status as PostStatus)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose status ..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Post Status</SelectLabel>
                          {POST_STATUS.map((status, index) => (
                            <SelectItem key={index} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div
                    className="min-h-[150px] border rounded-md overflow-hidden"
                    variants={itemVariants}
                  >
                    <RichTextEditor
                      noImage={true}
                      onChange={setContent}
                      value={content}
                    />
                  </motion.div>

                  {previewImage && (
                    <motion.div
                      className="relative rounded-md overflow-hidden border"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="h-80 relative">
                        <Image
                          src={previewImage || "/placeholder.svg"}
                          alt="Post image"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg"
                        onClick={() => {
                          setImage(null);
                          setPreviewImage("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}

                  <motion.div
                    className="flex flex-wrap gap-2"
                    variants={itemVariants}
                  >
                    {categories.map((category) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary border-primary/20"
                        >
                          <FolderIcon className="h-3 w-3 text-primary" />
                          {category.name}
                          <button
                            type="button"
                            onClick={() => removeCategory(category.id)}
                            className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-primary/20 ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                    {tags.map((tag) => (
                      <motion.div
                        key={tag.id || tag.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 bg-secondary/20 text-secondary"
                        >
                          <TagIcon className="h-3 w-3" />
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => removeTag(tag.id || "")}
                            className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-secondary/30"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div
                    className="flex flex-wrap gap-2"
                    variants={itemVariants}
                  >
                    {categories.length === 0 && (
                      <Popover
                        open={categorySearchOpen}
                        onOpenChange={setCategorySearchOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            role="combobox"
                            aria-expanded={categorySearchOpen}
                            className="gap-1"
                          >
                            <FolderIcon className="h-4 w-4" />
                            Category
                            <ChevronDown className="h-3 w-3 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-0" align="start">
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

                    <Popover
                      open={tagSearchOpen}
                      onOpenChange={setTagSearchOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          role="combobox"
                          aria-expanded={tagSearchOpen}
                          className="gap-1"
                          disabled={hasReachedMaxTags}
                        >
                          <TagIcon className="h-4 w-4" />
                          {hasReachedMaxTags ? "Max tags (10)" : "Add tags"}
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0" align="start">
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
                                        addTag({
                                          name: tagQuery.trim(),
                                          id: "",
                                        });
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

                    <ImageUploadButton
                      onUpload={handleImageUpload}
                      isUploading={isUploading}
                    />
                  </motion.div>
                </motion.div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </CardContent>

      {isExpanded && (
        <CardFooter className="px-4 py-3 border-t flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting || isUploading || !title.trim() || !content.trim()
            }
            className="px-6"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Post
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
