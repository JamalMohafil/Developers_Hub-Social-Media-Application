"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Check,
  CheckCircle,
  MessageCircle,
  MoreHorizontal,
  Share2,
  TagIcon,
  ThumbsUp,
  UserCheck,
  UserMinus,
  X,
} from "lucide-react";
import type { Tag } from "@/lib/type";

type PostProps = {
  commentsOpen: boolean;
  setCommentsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  post: any; // Replace with your actual Post type
  session: any; // Replace with your actual Session type
  likeCount: number;
  isLiked?: boolean;
  likeLoading: boolean;
  likePost: () => void;
  copied: boolean;
  setCopied: React.Dispatch<React.SetStateAction<boolean>>;
  handleCopy: (title: string, copied: boolean, setCopied: any) => void;
  userFollowStatus: boolean;
  followLoading: boolean;
  handleFollow: () => void;
  handleUnfollow: () => void;
  handleOpenEdit: () => void;
  setIsDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  formattedDate: (date: string | Date) => string;
  openComments: () => void;
  sharePost: () => void;
  isCurrentUserPost: boolean;
  CommentSystem: React.ComponentType<{
    postId: string;
    initialComments: any[];
    session: any;
  }>;
  hideFollow?:boolean;

};

// Spinner component
const Spinner = () => (
  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-middle motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
);

// Avatar component
const Avatar = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={`relative flex shrink-0 overflow-hidden rounded-full ${className}`}
  >
    {children}
  </div>
);

const AvatarImage = ({ src, alt }: { src: string; alt: string }) => (
  <Image
    src={src || "/placeholder-avatar.svg"}
    alt={alt}
    width={40}
    height={40}
    className="aspect-square h-full w-full"
  />
);

const AvatarFallback = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-800 text-slate-200">
    {children}
  </div>
);

const Badge = ({
  className,
  children,
}: {
  variant?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

// Button component
const Button = ({
  variant = "default",
  size = "default",
  className = "",
  onClick,
  disabled,
  children,
}: {
  variant?: string;
  size?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case "default":
        return "bg-primary text-primary-foreground hover:bg-primary/90";
      case "outline":
        return "border border-slate-700 hover:bg-slate-800 text-slate-200";
      case "ghost":
        return "hover:bg-slate-800 hover:text-slate-100";
      case "icon":
        return "p-0";
      default:
        return "bg-primary text-primary-foreground hover:bg-primary/90";
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "h-8 px-3 text-xs";
      case "default":
        return "h-10 px-4 py-2";
      case "icon":
        return "h-8 w-8";
      default:
        return "h-10 px-4 py-2";
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none ${getVariantClass()} ${getSizeClass()} ${className}`}
    >
      {children}
    </button>
  );
};

// Comments Dialog Component
export const PostDialog = ({
  commentsOpen,
  setCommentsOpen,
  post,
  session,
  likeCount,
  isLiked,
  likeLoading,
  likePost,
  copied,
  setCopied,
  handleCopy,
  userFollowStatus,
  followLoading,
  handleFollow,
  handleUnfollow,
  handleOpenEdit,
  setIsDeleteDialogOpen,
  formattedDate,
  hideFollow,
  openComments,
  sharePost,
  isCurrentUserPost,
  CommentSystem,
}: PostProps) => {
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Handle component mounting for client-side rendering
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  // Handle click outside to close dialog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setCommentsOpen(false);
      }
    };

    if (commentsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [commentsOpen, setCommentsOpen]);

  // Manage body styles when dialog is open
  useEffect(() => {
    // Save the original overflow style
    const originalStyle = window.getComputedStyle(document.body).overflow;

    // Apply the style when dialog opens
    if (commentsOpen) {
      // Force the scroll position to be fixed
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    }

    // Cleanup function to restore original styles when component unmounts or dialog closes
    return () => {
      if (commentsOpen) {
        const scrollY =
          Number.parseInt(document.body.style.top || "0", 10) * -1;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = originalStyle;
        window.scrollTo(0, scrollY);
      }
    };
  }, [commentsOpen]);

  if (!mounted || !commentsOpen) return null;

  return createPortal(
    <div
      key={post.id}
      className="fixed inset-0  z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center overflow-hidden"
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center   py-8">
        <div
          ref={dialogRef}
          className="bg-slate-950 border border-slate-800 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] p-6 animate-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Dialog Header */}
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
            <h2 className="text-lg font-semibold text-white">Comments</h2>

            {/* Close Button */}
            <button
              className="rounded-sm p-1 text-slate-400 hover:text-slate-200 focus:outline-none"
              onClick={() => setCommentsOpen(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          {/* Dialog Content with Scroll */}
          <div className="max-h-[80vh] overflow-y-auto pr-4">
            {/* Post content in dialog */}
            <div className="border-b border-slate-800 pb-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={post.user?.image || ""}
                      alt={post.user?.name || "User"}
                    />
                    <AvatarFallback>
                      {post.user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex mb-1 items-center gap-2">
                      <Link
                        href={`/profile/${post.user?.id}`}
                        className="text-sm font-medium text-white"
                      >
                        {post.user?.name || "User"}
                      </Link>
                      {hideFollow === false && session?.user?.id !== post?.user?.id ? (
                        userFollowStatus ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUnfollow}
                            disabled={followLoading}
                            className="flex items-center gap-1 py-1 h-[25px] text-slate-200"
                          >
                            <UserMinus className="h-4 w-4" />
                            {followLoading ? (
                              <>
                                <Spinner /> Following...
                              </>
                            ) : (
                              "Unfollow"
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleFollow}
                            disabled={followLoading}
                            className="flex items-center gap-1 h-[25px] text-white bg-primary"
                          >
                            <UserCheck className="h-4 w-4" />
                            {followLoading ? (
                              <>
                                <Spinner /> Unfollowing...
                              </>
                            ) : (
                              "Follow"
                            )}
                          </Button>
                        )
                      ) : null}
                    </div>

                    <div className="flex items-center text-xs text-slate-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formattedDate(post.createdAt)}</span>
                      {post.category && (
                        <Link
                          href={`/posts?categoryId=${post.category.id}`}
                          className="flex items-center"
                        >
                          <span className="mx-1">•</span>
                          <TagIcon className="h-3 w-3 mr-1" />
                          <span>{post.category.name}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dropdown Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-slate-800"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>

                  {isDropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 z-50 min-w-[160px] overflow-hidden rounded-md border border-slate-700 bg-slate-900 shadow-lg animate-in fade-in-80"
                    >
                      <button
                        onClick={() => {
                          handleCopy(post.title, copied, setCopied);
                          setIsDropdownOpen(false);
                        }}
                        className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-slate-200 outline-none hover:bg-slate-800"
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                            Title Copied
                          </>
                        ) : (
                          "Copy Title"
                        )}
                      </button>
                      <div className="mx-1 my-1 h-px bg-slate-700" />

                      {isCurrentUserPost && (
                        <>
                          <button
                            onClick={() => {
                              setCommentsOpen(false);
                              handleOpenEdit();
                              setIsDropdownOpen(false);
                            }}
                            className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-slate-200 outline-none hover:bg-slate-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setCommentsOpen(false);
                              setIsDeleteDialogOpen(true);
                              setIsDropdownOpen(false);
                            }}
                            className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-red-500 outline-none hover:bg-slate-800"
                          >
                            Delete
                          </button>
                          <div className="mx-1 my-1 h-px bg-slate-700" />
                        </>
                      )}

                      <button
                        onClick={() => setIsDropdownOpen(false)}
                        className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-red-500 outline-none hover:bg-slate-800"
                      >
                        Report
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold mb-2 text-white">
                {post.title}
              </h3>
              <div className="text-sm max-w-[90%] text-slate-200 text-justify">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>

              {post.imageUrl && (
                <div className="w-full pt-4">
                  <div className="rounded-xl overflow-hidden w-full h-[340px] bg-slate-900">
                    <Image
                      src={post.imageUrl || "/placeholder.svg"}
                      alt={post.title}
                      width={768}
                      height={432}
                      className="object-contain w-full h-full"
                      sizes="(max-width: 768px) 100vw, 768px"
                    />
                  </div>
                </div>
              )}

              <div className="px-4 pt-2 mt-2 flex justify-start gap-3 text-xs text-slate-400 border-t border-slate-800">
                <div className="flex items-center">
                  <ThumbsUp className="h-3 w-3 mr-1 text-primary" />
                  <span>{likeCount || 0} </span>
                </div>

                <button
                  onClick={openComments}
                  className="flex cursor-pointer space-x-3"
                >
                  <div> comments {post.commentCount || 0}</div>
                </button>
              </div>

              <div className="px-14 pt-4 mt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  {isLiked ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={likePost}
                      disabled={likeLoading}
                      className={`flex items-center bg-primary text-primary-foreground rounded-md px-4 py-2 ${likeLoading && "opacity-50"}`}
                    >
                      <ThumbsUp className="h-5 w-5 mr-2" />
                      <span>Like</span>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={likePost}
                      disabled={likeLoading}
                      className={`flex items-center text-slate-200 hover:bg-slate-800 rounded-md px-4 py-2 ${likeLoading && "opacity-50"}`}
                    >
                      <ThumbsUp className="h-5 w-5 mr-2" />
                      <span>Like</span>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center text-slate-200 hover:bg-slate-800 rounded-md px-4 py-2"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    <span>Comment</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center text-slate-200 hover:bg-slate-800 rounded-md px-4 py-2"
                    onClick={sharePost}
                  >
                    {copied ? (
                      <Check className="h-5 w-5 mr-2 text-primary" />
                    ) : (
                      <Share2 className="h-5 w-5 mr-2" />
                    )}
                    <span>Share</span>
                  </Button>
                </div>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center flex-wrap gap-3 mt-4">
                  {post.tags.map((tag: Tag) => (
                    <Link
                      href={`/posts?tagId=${tag.id}`}
                      key={tag.id || tag.name}
                    >
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <TagIcon className="h-3 w-3" />
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Comment System */}
            <CommentSystem
              postId={post.id}
              initialComments={[]}
              session={session}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
