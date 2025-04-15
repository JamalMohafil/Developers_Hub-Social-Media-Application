"use client";

import { SetStateAction, useState } from "react";
import {
  updateCommentSchema,
  type Comment,
  type SessionType,
} from "@/lib/type";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoaderCircle, SortDesc } from "lucide-react";
import CommentItem from "./CommentItem";

import { CommentSkeletons } from "@/components/ui/skeleton";
import Spinner from "@/components/utils/Spinner";
import { EditCommentDialog } from "./CommentDialog";
import { toast } from "react-toastify";
import { updateCommentAction } from "@/actions/posts/comment/update-comment.action";

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  onAddComment: (content: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
  onLoadMore: (isReset?: boolean) => void;
  hasMoreComments?: boolean;
  sortOrderDesc: boolean;
  onToggleSortOrder: () => void;
  setComments: React.Dispatch<SetStateAction<Comment[]>>;
  session: SessionType | null;
  loadMoreLoading: boolean;
  setPage: React.SetStateAction<any>;
  page: number;
  setLoadMoreLoading: React.Dispatch<SetStateAction<boolean>>;
  postId: string;
}

export default function CommentList({
  comments,
  isLoading,
  onAddComment,
  setPage,
  onLikeComment,
  loadMoreLoading,
  setLoadMoreLoading,
  postId,
  onLoadMore,
  setComments,
  hasMoreComments,
  sortOrderDesc,
  onToggleSortOrder,
  session,
}: CommentListProps) {
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!commentContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(commentContent);
      setCommentContent("");
    } finally {
      setIsSubmitting(false);
    }
  };
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editCommentLoading, setEditCommentLoading] = useState(false);
  const handleUpdateComment = async (commentId: string) => {
    if (!session)
      return toast.dark("You must be logged in to edit your comment");
    const dataToValidate = {
      content: editCommentText,
    };
    console.log(commentId, "commneitd");
    setEditCommentLoading(true);
    const validationResult = updateCommentSchema.safeParse(dataToValidate);
    if (!validationResult.success || validationResult.error) {
      const errorMessages = validationResult.error.errors
        ?.map((err) => err.message)
        .join(", ");
      toast.dark(`${errorMessages}`);
      setEditCommentLoading(false);
      return;
    }

    try {
      const res = await updateCommentAction(commentId, postId, editCommentText);
      if (res.status !== 200) {
        return toast.dark(res.message);
      }

      if (res && res.status === 200) {
        // Add new reply to the beginning of the list
        const newComments = comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              content: editCommentText,
            };
          }
          return comment;
        });
        setComments(newComments);

        toast.dark("Comment Updated successfully");
        // Update the cache for the first page
      } else {
        toast.dark(res?.message || "Something went wrong");
      }
    } catch (error: any) {
      console.error("Error adding reply:", error);
      return toast.dark(error.message || "Something went wrong");
    } finally {
      setEditCommentLoading(false);
      setIsEditOpen(false);
    }
  };
  const handleOpenEdit = (comment: Comment) => {
    setSelectedComment(comment);
    setEditCommentText(comment.content);
    setIsEditOpen(true);
  };
  const handleLoadMore = async (reset?: boolean) => {
    if (!reset) {
      setPage((prev: number) => prev + 1);
      await onLoadMore();
    } else {
      await onLoadMore(true);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Comments</h3>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-muted-foreground text-xs"
            onClick={onToggleSortOrder}
          >
            <SortDesc
              className={`h-4 w-4 ${!sortOrderDesc ? "rotate-180" : ""}`}
            />
            Sort by {sortOrderDesc ? "newest" : "oldest"}
          </Button>
        </div>

        {session && session.user && (
          <div className="flex gap-3 items-start pt-2 pb-4 border-b">
            <Avatar className="h-8 w-8 border">
              <AvatarImage
                src={session.user?.image || "placeholder.svg"}
                alt={session?.user.name || "User"}
              />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                {session?.user.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                value={commentContent}
                disabled={isSubmitting}
                onChange={(e) => setCommentContent(e.target.value)}
                className="min-h-[100px] resize-none bg-muted"
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleAddComment}
                  disabled={!commentContent.trim() || isSubmitting || isLoading}
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Comment"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <CommentSkeletons />
        ) : comments.length > 0 ? (
          <div className="divide-y">
            {comments.map((comment) => (
              <CommentItem
                setLoadMoreLoading={setLoadMoreLoading}
                setPage={setPage}
                key={comment.id}
                postId={postId}
                handleLoadMore={handleLoadMore}
                comment={comment}
                setComments={setComments}
                session={session}
                comments={comments}
                onLikeComment={onLikeComment}
                currentUserId={session?.user.id}
                onOpenEdit={handleOpenEdit} // تمرير دالة فتح التعديل
              />
            ))}

            {hasMoreComments && (
              <div className="pt-4 flex justify-center">
                <Button
                  variant="outline"
                  disabled={loadMoreLoading}
                  onClick={() => handleLoadMore()}
                >
                  {loadMoreLoading ? (
                    <Spinner color="white" />
                  ) : (
                    " Load more comments"
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 flex justify-center items-center  text-center text-muted-foreground">
            {loadMoreLoading ? (
              <Spinner color="white" />
            ) : (
              " No comments yet. Be the first to comment!"
            )}
          </div>
        )}
      </div>
      <EditCommentDialog
        comment={selectedComment!}
        commentText={editCommentText}
        editCommentLoading={editCommentLoading}
        handleUpdateComment={handleUpdateComment}
        isEdit={isEditOpen}
        setIsEdit={setIsEditOpen}
        setCommentText={setEditCommentText}
      />
    </>
  );
}
