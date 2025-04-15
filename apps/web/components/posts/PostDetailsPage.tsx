"use client";
import CommentSystem from "@/components/posts/comment/CommentSystem";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Spinner from "@/components/utils/Spinner";
import type { Post, SessionType } from "@/lib/type";
import { formattedDate, handleCopy } from "@/lib/utils";
import { usePostItemLogic } from "@/logic/post/post-item.logic";
import {
  Calendar,
  Check,
  CheckCircle,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Tag,
  TagIcon,
  ThumbsUp,
  UserCheck,
  UserMinus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import EditPostDialog from "./EditPostDialog";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import { DeleteDialog } from "../utils/DeleteDialog";
 
type Props = { currentPost: Post; session: SessionType | null };

const PostDetailsPage = ({ currentPost, session }: Props) => {
  const {
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleOpenEdit,
    isCurrentUserPost,
    handleDeletePost,
    handleUnfollow,
    handleFollow,
    likePost,
    openComments,
    sharePost,
    toggleExpand,
    isLiked,
    likeLoading,
    likeCount,
    commentsOpen,
    post,
    setPost,
    expanded,
    recentComment,
    copied,
    setCopied,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    setCommentsOpen,
    userFollowStatus,
    followLoading,
    deleteLoading,
  } = usePostItemLogic({
    post: currentPost,
    session,
    refreshPosts: () => {},
  });

  return (
    <div className="container relative mx-auto py-8 px-4">
      <EditPostDialog
      key={post.id}
        setPost={setPost}
        post={post}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        setIsOpen={setIsEditDialogOpen}
      />

      <DeleteDialog
        handleDelete={handleDeletePost}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
      />
      <Card className="max-w-4xl mx-auto shadow-lg bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage
                  src={post.user?.image || ""}
                  alt={post.user?.name || "User"}
                />
                <AvatarFallback className="text-lg">
                  {post.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Link
                    href={`/profile/${post.user?.id}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {post.user?.name || "User"}
                  </Link>

                  {session?.user?.id !== post?.user?.id &&
                    (userFollowStatus ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUnfollow}
                        disabled={followLoading}
                        className="flex items-center gap-1 h-8 text-slate-200"
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
                        className="flex items-center gap-1 h-8 text-white"
                      >
                        <UserCheck className="h-4 w-4" />
                        {followLoading ? (
                          <>
                            <Spinner /> Following...
                          </>
                        ) : (
                          "Follow"
                        )}
                      </Button>
                    ))}
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formattedDate(post.createdAt)}</span>
                  {post.category && (
                    <Link
                      href={`/posts?categoryId=${post.category.id}`}
                      className="flex items-center hover:underline"
                    >
                      <span className="mx-2">•</span>
                      <Tag className="h-4 w-4 mr-1" />
                      <span>{post.category.name}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-muted"
                >
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem
                  onClick={() => handleCopy(post.title, copied, setCopied)}
                  className="cursor-pointer"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Title Copied
                    </>
                  ) : (
                    "Copy Title"
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isCurrentUserPost && (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        handleOpenEdit();
                      }}
                      className="cursor-pointer"
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setIsDeleteDialogOpen(true);
                      }}
                      className="text-destructive cursor-pointer"
                    >
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem className="text-destructive cursor-pointer">
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{post.title}</h1>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {post.imageUrl && (
            <div className="my-6">
              <div className="rounded-xl overflow-hidden w-full relative h-[400px] bg-slate-900">
                <Image
                  src={post.imageUrl || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-contain w-full"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
              </div>
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 mt-6">
              {post.tags.map((tag) => (
                <Link href={`/posts?tagId=${tag.id}`} key={tag.id || tag.name}>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 py-1 px-3 bg-secondary/20 text-secondary hover:bg-secondary hover:text-card-foreground"
                  >
                    <TagIcon className="h-3 w-3" />
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 mr-1 text-primary" />
                <span>{likeCount || 0} likes</span>
              </div>

              <button
                onClick={openComments}
                className="flex items-center cursor-pointer hover:underline"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                <span>{post.commentCount || 0} comments</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6">
            <Button
              variant={isLiked ? "default" : "outline"}
              size="lg"
              onClick={likePost}
              disabled={likeLoading}
              className={`flex items-center justify-center gap-2 ${isLiked ? "bg-primary/90 hover:bg-primary" : ""}`}
            >
              <ThumbsUp className="h-5 w-5" />
              <span className="font-medium">Like</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="flex items-center justify-center gap-2"
              onClick={openComments}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">Comment</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="flex items-center justify-center gap-2"
              onClick={sharePost}
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Share2 className="h-5 w-5" />
              )}
              <span className="font-medium">Share</span>
            </Button>
          </div>

          <Separator className="my-8" />

          {/* Comment System */}
          <Suspense fallback={<div>Loading...</div>}>
            <div className="mt-6">
              <CommentSystem
                postId={post.id}
                initialComments={post.comments || []}
                session={session}
              />
            </div>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostDetailsPage;
