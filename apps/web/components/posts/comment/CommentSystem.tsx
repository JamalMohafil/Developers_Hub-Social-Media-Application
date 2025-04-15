"use client";

import { useState, useEffect, useCallback } from "react";
import type { Comment, SessionType } from "@/lib/type";
  import { toast } from "react-toastify";
import { getPostCommentsAction } from "@/actions/posts/comment/get-post-comments.action";
import { addCommentAction } from "@/actions/posts/comment/add-comment.action";
import { likeCommentAction } from "@/actions/posts/comment/like-comment.action";
import CommentList from "./CommentList";
 
 

interface CommentSystemProps {
  postId: string;
  initialComments?: Comment[];
  className?: string;
  session: SessionType | null;
}



export default function CommentSystem({
  postId,
  initialComments = [],
  className = "",
  session,
}: CommentSystemProps) {
  console.log(initialComments,'initial ')
  const [comments, setComments] = useState<Comment[]>([]);
   const [isLoading, setIsLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [sortOrderDesc, setSortOrderDesc] = useState(true);
  const limit = 5;
  const [initialLoadDone, setInitialLoadDone] = useState(
    initialComments.length > 0
  );
  console.log(comments)
  console.log(sortOrderDesc)
  const fetchComments = useCallback(
    async (reset = false) => {
      try {
        const newPage = reset ? 1 : page;
        const fetchedComments = await getPostCommentsAction(
          limit,
          newPage,
          postId,
          sortOrderDesc ? "desc" : "asc"
        );
     console.log(fetchedComments,'fetec');

        if (reset) {
          setComments(fetchedComments);
        } else {
          setComments((prev) => [...prev, ...fetchedComments]);
        }

        setHasMoreComments(fetchedComments.length === limit);
        if (!reset) {
          setPage(newPage + 1);
        } else {
          setPage(1); // Reset to page 2 since we just loaded page 1
        }

        setInitialLoadDone(true);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    },
    [limit, postId, sortOrderDesc, page]
  );
  const getComments = useCallback(
    async (reset: boolean) => {
      setIsLoading(true);
      await fetchComments(reset);
      setIsLoading(false);
    },
    [fetchComments]
  );
  // Only fetch comments if we don't have initial comments
  useEffect(() => {
    if (!initialLoadDone) {
      getComments(true);
     }
  }, [initialLoadDone, getComments]);
   // Update state when initialComments prop changes
   console.log(page,limit,'lasdf')
  useEffect(() => {
    if (initialComments.length > 0) {
       setComments(initialComments);
      setInitialLoadDone(true);
      setPage(1); // Next load will be page 2
    
      setHasMoreComments(initialComments.length === limit);
    }
  }, [initialComments, limit]);
   const addComment = async (content: string) => {
    if (!session) return toast.dark("You must be logged in to comment");
    if (!content) return toast.dark("Please enter a comment");
    try {
      const res = await addCommentAction(postId, content);
      if (res && !res.error) {
        setComments((prev) => {
          if (prev) {
            return [res, ...prev];
          } else {
            return [res];
          }
        });
        return res;
      } else {
        toast.dark(res?.message || "Something went wrong");
        throw new Error(res?.message || "Something went wrong");
      }
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.dark(error.message || "Something went wrong");
      throw error;
    }
  };

  const handleToggleSortOrder = () => {
    setSortOrderDesc(!sortOrderDesc);
    setPage(1);
    setInitialLoadDone(false); // Reset initial load flag to trigger a fresh load
  };

  const likeComment = async (commentId: string) => {
    if (!session) return toast.dark("You must be logged in to like a comment");

    const currentComment = comments.find((comment) => comment.id === commentId);
    if (!currentComment) return;

    // Save original state for error recovery
    const wasLiked = currentComment.isLiked === true;
    const originalLikeCount = currentComment.likeCount || 0;

    // Optimistically update UI
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment.id === commentId) {
          const newIsLiked = !comment.isLiked;
          const newLikeCount = newIsLiked
            ? (comment.likeCount || 0) + 1
            : Math.max(0, (comment.likeCount || 0) - 1);

          return {
            ...comment,
            isLiked: newIsLiked,
            likeCount: newLikeCount,
          };
        }
        return comment;
      })
    );

    // Try to update the server
    try {
      const result = await likeCommentAction(commentId);
       if (!result || result.error || !result.action) {
        throw new Error("Failed to update server");
      }
    } catch (error: any) {
      console.error("Error liking comment:", error);
      toast.dark(error.message || "Something went wrong");

      // Restore previous state on error
      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              isLiked: wasLiked,
              likeCount: originalLikeCount,
            };
          }
          return comment;
        })
      );

      return error;
    }
  };

  const handleLoadMore = async (isReset?: boolean) => {
    setLoadMoreLoading(true);
    await fetchComments(isReset);
    setLoadMoreLoading(false);
  };

  return (
    <div className={className}>
      <CommentList
        comments={comments}
        setComments={setComments}
        setPage={setPage}
        page={page}
        isLoading={isLoading}
        onAddComment={addComment}
        postId={postId}
        setLoadMoreLoading={setLoadMoreLoading}
        loadMoreLoading={loadMoreLoading}
        onLikeComment={likeComment}
        onLoadMore={handleLoadMore}
        hasMoreComments={hasMoreComments}
        sortOrderDesc={sortOrderDesc}
        onToggleSortOrder={handleToggleSortOrder}
        session={session}
      />
    </div>
  );
}
