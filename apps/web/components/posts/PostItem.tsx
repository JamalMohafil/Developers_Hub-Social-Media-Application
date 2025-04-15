import { Post, SessionType } from "@/lib/type";
import { formattedDate, handleCopy } from "@/lib/utils";
import {
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Tag,
  TagIcon,
  ThumbsUp,
  User,
  UserCheck,
  UserMinus,
} from "lucide-react";
import Image from "next/image";

import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import Link from "next/link";
import Spinner from "../utils/Spinner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { usePostItemLogic } from "@/logic/post/post-item.logic";
import EditPostDialog from "./EditPostDialog";
import CommentSystem from "./comment/CommentSystem";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { DeleteDialog } from "../utils/DeleteDialog";
import { PostDialog } from "./PostDialog";
import { memo, useCallback } from "react";
import ImageByChar from "../utils/ImageByChar";

export type PostItemProps = {
  post: Post;
  session: SessionType | null;
  refreshPosts: () => void;
  hideFollow?:boolean;
};
// كود أمثل لمكون PostItem
const PostItem = memo(
  ({ post: currentPost, session, refreshPosts,hideFollow=false }: PostItemProps) => {
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
      refreshPosts,
    });

  
    // رندر مشروط للأجزاء الثقيلة فقط عند الحاجة
    const renderComments = commentsOpen ? (
      <PostDialog 
      hideFollow={hideFollow}
        CommentSystem={CommentSystem}
        commentsOpen={commentsOpen}
        copied={copied}
        setCopied={setCopied}
        followLoading={followLoading}
        formattedDate={formattedDate}
        likeLoading={likeLoading}
        likePost={likePost}
        openComments={openComments}
        handleCopy={handleCopy}
        handleFollow={handleFollow}
        handleOpenEdit={handleOpenEdit}
        handleUnfollow={handleUnfollow}
        post={post}
        sharePost={sharePost}
        isCurrentUserPost={isCurrentUserPost}
        isLiked={isLiked}
        likeCount={likeCount}
        session={session}
        setCommentsOpen={setCommentsOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        userFollowStatus={userFollowStatus as boolean}
      />
    ) : null;

    // الهيكل النهائي للمكون مع أمثلة التحسينات
    return (
      <article
        className={`bg-card ${deleteLoading ? "pointer-events-none opacity-50" : ""} 
      text-card-foreground rounded-lg overflow-hidden shadow-md border border-border 
      hover:shadow-lg transition-shadow duration-300`}
      >
        {/* تحميل الأجزاء بشكل شرطي فقط عند الحاجة */}
        {isCurrentUserPost && isEditDialogOpen && (
          <EditPostDialog
            key={post.id}
            setPost={setPost}
            post={post}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            setIsOpen={setIsEditDialogOpen}
          />
        )}

        {isDeleteDialogOpen && (
          <DeleteDialog
            handleDelete={handleDeletePost}
            isDeleteDialogOpen={isDeleteDialogOpen}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          />
        )}
        <div className="p-4 flex items-center space-x-3 border-b border-border">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {post.user?.image ? (
              <Image
                src={post.user.image || "/placeholder.svg"}
                alt={post.user?.name || "User"}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
             <ImageByChar name={post.user?.name || "User"} />
            )}
          </div>
          <div className="flex-1">
            <div className="flex gap-2 mb-0.5 items-center justify-between">
              <div className="flex gap-2 items-center">
                <div className="flex gap-2 items-center">
                  <Link
                    href={`/profile/${post.user?.id}`}
                    className="font-medium text-card-foreground text-base"
                  >
                    {post.user?.name || "User"}
                    {isCurrentUserPost && (
                      <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </Link>
                  {hideFollow === false && session?.user?.id !== post?.user?.id ? (
                    userFollowStatus ? (
                      <Button
                        variant={"outline"}
                        size={"sm"}
                        onClick={handleUnfollow}
                        disabled={followLoading}
                        className="flex items-center gap-1 py-1 h-[25px]   text-slate-200"
                      >
                        <UserMinus className="h-4 w-4" />{" "}
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
                        variant={"default"}
                        size={"sm"}
                        onClick={handleFollow}
                        disabled={followLoading}
                        className="flex items-center gap-1 h-[25px]   text-white"
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
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem
                    onClick={() => handleCopy(post.title, copied, setCopied)}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Title Copied
                      </>
                    ) : (
                      "Copy Title"
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isCurrentUserPost && (
                    <>
                      <DropdownMenuItem onClick={handleOpenEdit}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>{" "}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem className="text-destructive">
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formattedDate(post.createdAt)}</span>
              {post.category && (
                <Link
                  href={`/posts?categoryId=${post.category.id}`}
                  className="flex items-center"
                >
                  <span className="mx-1">•</span>
                  <Tag className="h-3 w-3 mr-1" />
                  <span>{post.category.name}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
        {/* Post content */}
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-3 text-card-foreground">
            {post.title}
          </h2>
          <div
            className={`text-sm text-card-foreground ${!expanded ? "line-clamp-3" : ""}`}
          >
            {/* This would handle RichText content */}
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
          {post.content.length > 150 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpand}
              className="mt-2 text-white p-0 h-auto font-medium text-sm flex items-center"
            >
              {expanded ? "Show Less" : "See More"}
              <ChevronDown
                className={`ml-1 h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </Button>
          )}
        </div>
        {/* Post image */}
        {post.imageUrl && (
          <div className="w-full">
            <div className="relative  w-full">
              <Image
                src={post.imageUrl || "/placeholder.svg"}
                alt={post.title}
                width={768}
                height={432}
                className="object-contain  max-h-[300px]"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          </div>
        )}
        {/* Post stats */}
        <div className="px-4 py-3 flex justify-start gap-3 text-xs text-muted-foreground border-t border-border">
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
        {/* Recent comment if available */}
        {recentComment && (
          <div className="px-4 py-3 bg-muted border-t border-border">
            <div className="flex items-start space-x-2">
              <div className="h-[32px] w-[32px] rounded-full justify-center items-center flex  flex-shrink-0 overflow-hidden">
                {recentComment.user?.image ? (
                  <Image
                    src={recentComment.user?.image || "placeholder.svg"}
                    alt={recentComment?.user.name || ""}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <ImageByChar
                    name={recentComment?.user?.name}
                    className="text-xl"
                   />
                )}
              </div>
              <div className="flex-1">
                <div className="bg-card rounded-2xl px-3 py-2">
                  <p className="text-xs font-medium text-card-foreground">
                    {recentComment.user?.name || "User"}
                  </p>
                  <p className="text-xs text-card-foreground">
                    {recentComment.content}
                  </p>
                </div>
                <div
                  onClick={openComments}
                  className="flex items-center mt-1 text-xs text-muted-foreground space-x-3"
                >
                  <span>{formattedDate(recentComment.createdAt)}</span>
                  <button className="font-medium text-primary hover:text-primary/90">
                    Like
                  </button>
                  <button className="font-medium text-primary hover:text-primary/90">
                    Reply
                  </button>
                </div>
              </div>
            </div>
            <button
              className="text-xs font-medium text-primary hover:text-primary/90 mt-2"
              onClick={openComments}
            >
              View more comments
            </button>
          </div>
        )}
        {/* Post actions */}
        <div className="px-14 py-3 border-t border-border">
          <div className="flex justify-between">
            {isLiked ? (
              <Button
                variant="default"
                size="sm"
                onClick={likePost}
                disabled={likeLoading}
                className={`flex items-center text-card-foregroundrounded-md px-4 py-2 ${likeLoading && "opacity-50"}`}
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
                className={`flex items-center   text-card-foreground   hover:bg-muted rounded-md px-4 py-2 ${likeLoading && "opacity-50"}`}
              >
                <ThumbsUp className="h-5 w-5 mr-2" />
                <span>Like</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center text-card-foreground hover:bg-muted rounded-md px-4 py-2"
              onClick={openComments}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              <span>Comment</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center text-card-foreground hover:bg-muted rounded-md px-4 py-2"
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
        {/* باقي المكون كما هو مع تحسينات صغيرة */}

        {renderComments}
      </article>
    );
  }
);

PostItem.displayName = "PostItem";
export default PostItem;
