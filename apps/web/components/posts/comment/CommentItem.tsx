"use client";

import { useState } from "react";
import { Reply, SessionType, type Comment } from "@/lib/type";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReplySkeletons } from "@/components/ui/skeleton";
import {
  CheckCircle,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow, set } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";

import { handleCopy } from "@/lib/utils";
import useCommentLogic from "@/logic/post/comment/comment.logic";

import ReplyItem from "../reply/ReplyItem";
import useReplyLogic from "@/logic/post/reply/reply.logic";
import { DeleteDialog } from "@/components/utils/DeleteDialog";
import { EditCommentDialog } from "./CommentDialog";
import ImageByChar from "@/components/utils/ImageByChar";

interface CommentItemProps {
  comment: Comment;
  onLikeComment: (commentId: string) => Promise<void>;
  currentUserId?: string;
  session: SessionType | null;
  postId: string;
  handleLoadMore: (isReset?: boolean) => void;
  setLoadMoreLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  onOpenEdit: (comment: Comment) => void; // إضافة prop للتعامل مع فتح التعديل
}
export const REPLIES_LIMIT = 5;

export default function CommentItem({
  comment,
  onLikeComment,
  session,
  currentUserId,
  comments,
  postId,
  setLoadMoreLoading,
  setPage,
  handleLoadMore,
  setComments,
  onOpenEdit,
}: CommentItemProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const isCurrentUserComment = comment.user?.id === currentUserId;
  const [commentText, setCommentText] = useState<string>("");
  // Generate the base key for replies that doesn't depend on page
  const {
    handleLikeComment,
    handleDeleteComment,
    handleUpdateComment,
    likeCommentLoading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    editCommentLoading,
    isEdit,
    setIsEdit,
  } = useCommentLogic({
    comment,
    setComments,
    handleLoadMore,
    setLoadMoreLoading,
    setPage,
    postId,
    comments,
    commentText,
    onLikeComment,
    session,
  });

  const {
    addReply,
    toggleReplies,
    deleteReply,
    loadMoreReplies,
    isSubmitting,
    isReplying,
    setIsReplying,
    replyContent,
    setReplyContent,
    showReplies,
    replies,
    replyCount,
    loadingMore,
    mutateReplies,
    getRepliesLoading,
    shouldShowLoadMore,
    hasReplies,
  } = useReplyLogic({ comment, postId, session });

  const handleDialogOpen = () => setDeleteDialogOpen(true);
  const formattedDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error: any) {
      return "some time ago";
    }
  };

  const handleOpenEdit = () => {
    onOpenEdit(comment);
    setIsEdit(true);
    // setCommentText(comment.content);
  };
  return (
    <div className="group py-4 first:pt-0 animate-in fade-in-0 slide-in-from-top-2">
      {/* <EditCommentDialog
        comment={comment}
        commentText={commentText}
        editCommentLoading={editCommentLoading}
        handleUpdateComment={handleUpdateComment}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        setCommentText={setCommentText}
      /> */}
      <div className="flex gap-3 items-start">
        <DeleteDialog
          isDeleteDialogOpen={deleteDialogOpen}
          setIsDeleteDialogOpen={setDeleteDialogOpen}
          handleDelete={handleDeleteComment}
        />

        <div className="relative h-8 w-8 overflow-hidden rounded-full border">
          {comment.user?.image ? (
            <Image
              src={comment.user.image}
              alt={comment.user?.name || "User"}
              width={50}
              height={50}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageByChar className="text-sm" name={comment.user?.name} />
          )}
        </div>
        <div className="flex flex-col flex-1 gap-1 min-w-0">
          <div className="flex flex-col rounded-2xl bg-muted px-4 py-2.5">
            <div className="flex justify-between items-center">
              <Link
                href={`/profile/${comment.user?.id}`}
                className="font-medium text-sm"
              >
                {comment.user?.name || "Anonymous User"}
                {isCurrentUserComment && (
                  <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </Link>
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
                    onClick={() =>
                      handleCopy(comment.content, copied, setCopied)
                    }
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Text Copied
                      </>
                    ) : (
                      "Copy Text"
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isCurrentUserComment && (
                    <>
                      <DropdownMenuItem onClick={handleOpenEdit}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDialogOpen}
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

            <p className="text-sm mt-0.5 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center gap-3 px-1 text-xs">
            <span className="text-muted-foreground">
              {formattedDate(comment.createdAt)}
            </span>

            <button
              className={`flex items-center cursor-pointer gap-1 font-medium ${likeCommentLoading && "opacity-30"} ${
                comment.isLiked
                  ? "text-rose-500"
                  : "text-muted-foreground hover:text-primary"
              } transition-colors`}
              onClick={handleLikeComment}
              disabled={likeCommentLoading}
            >
              <Heart
                className={`h-3.5 w-3.5 ${comment.isLiked ? "fill-rose-500 stroke-rose-500" : ""}`}
              />
              {comment.likeCount}
            </button>

            <button
              className="text-muted-foreground hover:text-primary font-medium transition-colors"
              onClick={() => setIsReplying(!isReplying)}
            >
              Reply
            </button>
          </div>

          {isReplying && (
            <div className="mt-2 flex gap-2">
              <div className="ml-4 border-l-2 pl-4 border-muted h-full" />
              <div className="flex-1">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px] bg-muted"
                  disabled={isSubmitting}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyContent("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={addReply}
                    disabled={!replyContent.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Reply"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {hasReplies && (
            <div className="mt-2">
              <button
                className="text-xs cursor-pointer flex items-center gap-1 text-primary hover:text-primary/80 font-medium ml-1"
                onClick={toggleReplies}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {showReplies
                  ? `Hide ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
                  : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
              </button>

              {showReplies && (
                <div className="space-y-3 mt-1.5">
                  <div className="flex">
                    <div className="ml-4 border-l-2 pl-4 border-muted" />
                    <div className="flex-1 space-y-3">
                      {getRepliesLoading ? (
                        <ReplySkeletons />
                      ) : replies && replies.length > 0 ? (
                        replies.map((reply: Reply) => (
                          <ReplyItem
                            deleteReply={deleteReply}
                            key={reply.id}
                            mutateReplies={mutateReplies}
                            postId={postId}
                            commentId={comment.id}
                            session={session}
                            reply={reply}
                            currentUserId={currentUserId}
                          />
                        ))
                      ) : (
                        !loadingMore && (
                          <p className="text-sm text-muted-foreground p-2">
                            No replies yet
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {shouldShowLoadMore && !getRepliesLoading && (
                <div className="pt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    disabled={loadingMore}
                    onClick={() => loadMoreReplies()}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load more replies"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
