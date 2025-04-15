import { deleteCommentAction } from "@/actions/posts/comment/delete-comment.action";
import { updateCommentAction } from "@/actions/posts/comment/update-comment.action";
import { Comment, SessionType, updateCommentSchema } from "@/lib/type";
import React, { SetStateAction, useState } from "react";
import { toast } from "react-toastify";

type Props = {
  onLikeComment: (commentId: string) => Promise<void>;
  comment: Comment;
  session: SessionType | null;
  commentText: string;
  setComments: React.Dispatch<SetStateAction<Comment[]>>;
  comments: Comment[];
  handleLoadMore: (isReset?: boolean) => void;
  setLoadMoreLoading: React.Dispatch<SetStateAction<boolean>>;
  setPage: React.Dispatch<SetStateAction<number>>;
  postId: string;
};

const useCommentLogic = ({
  onLikeComment,
  comment,
  session,
  commentText,
  setComments,
  comments,
  handleLoadMore,
  setPage,
  setLoadMoreLoading,
  postId,
}: Props) => {
  const [likeCommentLoading, setLikeCommentLoading] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [editCommentLoading, setEditCommentLoading] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const deleteComment = async () => {
    if (!session) return toast.dark("You must be logged in to reply");

    try {
      const res = await deleteCommentAction(postId, comment.id);
      if (res.status !== 200) {
        return toast.dark(res.message);
      }

      if (res && res.status === 200) {
        // Add new reply to the beginning of the list
        const newComments = comments.filter(
          (newComment) => newComment.id !== comment.id
        );
        setComments(newComments);
        if (newComments.length === 0) {
          setPage(1);
          setLoadMoreLoading(true);
          await handleLoadMore(true);
          setLoadMoreLoading(false);
        }

        toast.dark("Comment deleted successfully");
      } else {
        toast.dark(res?.message || "Something went wrong");
      }
    } catch (error: any) {
      console.error("Error adding reply:", error);
      toast.dark(error.message || "Something went wrong");
    }
  };
  const editComment = async (commentId: string) => {
    if (!session)
      return toast.dark("You must be logged in to edit your comment");
    const dataToValidate = {
      content: commentText,
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
      const res = await updateCommentAction(commentId, postId, commentText);
      if (res.status !== 200) {
        return toast.dark(res.message);
      }

      if (res && res.status === 200) {
        // Add new reply to the beginning of the list
        const newComments = comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              content: commentText,
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
      setIsEdit(false);
    }
  };

  const handleDeleteComment = async () => {
    setDeleteDialogOpen(true);
    await deleteComment();
    setDeleteDialogOpen(false);
  };
  const handleLikeComment = async () => {
    setLikeCommentLoading(true);
    await onLikeComment(comment.id);
    setLikeCommentLoading(false);
  };

    const handleUpdateComment = async (commentId: string) => {
    if (editCommentLoading) return;
     await editComment(commentId);
  };

  return {
    handleLikeComment,
    handleDeleteComment,
    handleUpdateComment,
    likeCommentLoading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    editCommentLoading,
    isEdit,
    setIsEdit,
  };
};

export default useCommentLogic;
