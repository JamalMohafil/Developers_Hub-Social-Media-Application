import { addReplyAction } from "@/actions/posts/reply/add-reply.action";
import { deleteReplyAction } from "@/actions/posts/reply/delete-reply.action";
import { getCommentRepliesAction } from "@/actions/posts/reply/get-comment-replies.action";
import { REPLIES_LIMIT } from "@/components/posts/comment/CommentItem";
import { Comment, Reply, SessionType } from "@/lib/type";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useSWR, { mutate } from "swr";

type Props = {
  comment: Comment;
  session: SessionType | null;
  postId: string;
};

const useReplyLogic = ({ comment, session, postId }: Props) => {
  const baseRepliesKey = `/api/comments/${comment.id}/replies`;
  const [showReplies, setShowReplies] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [hasMoreReplies, setHasMoreReplies] = useState<boolean>(true);
  const [replyCount, setReplyCount] = useState<number>(comment.replyCount || 0);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const hasReplies = replyCount && replyCount > 0 ? true : false;

  const repliesKey = showReplies
    ? `${baseRepliesKey}?page=1&limit=${REPLIES_LIMIT}`
    : null;

  const {
    data: repliesData,
    error,
    isLoading: getRepliesLoading,
    mutate: mutateReplies,
  } = useSWR(
    repliesKey,
    async () => {
      try {
        return await getCommentRepliesAction(REPLIES_LIMIT, 1, comment.id);
      } catch (e) {
        console.log(e);
        throw e;
      }
    },
    {
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      revalidateOnFocus: true,
    }
  );

  const [replies, setReplies] = useState<Reply[]>([]);
  // Update local state when SWR data changes for first page
  useEffect(() => {
    if (repliesData) {
      if (page === 1) {
        setReplies(repliesData);
      } else {
        const existingIds = new Set(replies.map((reply) => reply.id));
        const newUniqueReplies = repliesData.filter(
          (reply: Reply) => !existingIds.has(reply.id)
        );
        setReplies((prev) => [...prev, ...newUniqueReplies]);
      }

      if (repliesData.length < REPLIES_LIMIT) {
        setHasMoreReplies(false);
      } else {
        setHasMoreReplies(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repliesData, REPLIES_LIMIT]);
  const shouldShowLoadMore =
    hasReplies && showReplies && hasMoreReplies && replies.length < replyCount;
  // Function to load more replies
  const loadMoreReplies = useCallback(
    async (reset: boolean = false) => {
      if (loadingMore || !hasMoreReplies) return;

      setLoadingMore(true);
      const nextPage = reset ? 1 : page + 1;

      try {
        // Create the next page key
        const nextPageKey = `${baseRepliesKey}?page=${nextPage}&limit=${REPLIES_LIMIT}`;

        // Fetch additional replies
        const moreReplies = await getCommentRepliesAction(
          REPLIES_LIMIT,
          nextPage,
          comment.id
        );
        if (moreReplies) {
          mutate(nextPageKey, moreReplies, false);

          setReplies((prev) => [...prev, ...moreReplies]);

          setPage(nextPage);
          if (moreReplies.length < REPLIES_LIMIT) {
            setHasMoreReplies(false);
          } else {
            // No more replies available
            setHasMoreReplies(false);
          }
        } else {
          // No more replies available
          setHasMoreReplies(false);
        }
      } catch (error) {
        console.error("Error loading more replies:", error);
        toast.dark("Failed to load more replies");
      } finally {
        setLoadingMore(false);
      }
    },
    [baseRepliesKey, comment.id, hasMoreReplies, loadingMore]
  );
  const addReply = async () => {
    if (!session) return toast.dark("You must be logged in to reply");
    if (!replyContent) return toast.dark("Please enter a reply");

    setIsSubmitting(true);

    try {
      const res = await addReplyAction(comment.id, postId, replyContent);

      if (res && !res.error) {
        setIsReplying(false);

        // Make sure replies are visible
        if (!showReplies) {
          setShowReplies(true);
          setPage(1);
        }

        // Add new reply to the beginning of the list
        const updatedReplies = [res, ...replies];
        setReplies(updatedReplies);

        // Update reply count
        setReplyCount((prev) => prev + 1);

        // Clear input
        setReplyContent("");
        const firstPageKey = `${baseRepliesKey}?page=1&limit=${REPLIES_LIMIT}`;

        // Update the cache for the first page
        mutate(
          firstPageKey,
          (oldData: any) => {
            if (oldData) {
              return [res, ...oldData].slice(0, REPLIES_LIMIT);
            }
            return [res];
          },
          false
        );
      } else {
        toast.dark(res?.message || "Something went wrong");
      }
    } catch (error: any) {
      console.error("Error adding reply:", error);
      toast.dark(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };
  const deleteReply = async (replyId: string) => {
    if (!session) return toast.dark("You must be logged in to reply");

    try {
      const res = await deleteReplyAction(postId, comment.id, replyId);
      if (res.status !== 200) {
        return toast.dark(res.message);
      }

      if (res && res.status === 200) {
        // Add new reply to the beginning of the list
        const newReplies = replies.filter((reply) => reply.id !== replyId);
        setReplies(newReplies);

        // Update reply count
        setReplyCount((prev) => prev - 1);
        if (newReplies.length === 0 && shouldShowLoadMore) {
          await loadMoreReplies(true);
        }
        // Clear input
        setReplyContent("");
        toast.dark("Reply deleted successfully");
        const pageKey = `${baseRepliesKey}?page=${page}&limit=${REPLIES_LIMIT}`;

        mutate(
          pageKey,
          (oldData: any) => {
            if (oldData) {
              const newOldData = oldData.filter(
                (reply: Reply) => reply.id !== replyId
              );
              return [...newOldData];
            }
            return [];
          },
          false
        );
      } else {
        toast.dark(res?.message || "Something went wrong");
      }
    } catch (error: any) {
      console.error("Error adding reply:", error);
      toast.dark(error.message || "Something went wrong");
    }
  };

  // Reset pagination when toggling reply visibility
  const toggleReplies = () => {
    // If we're hiding replies, clear the cache when we close
    if (showReplies) {
      // Reset page to 1 for next time
      setPage(1);
      setReplies([]);
    } else {
      setPage(1);
      setHasMoreReplies(true);
    }

    setShowReplies(!showReplies);
  };

  return {
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
    hasMoreReplies,
    loadingMore,
    mutateReplies,
    getRepliesLoading,
    shouldShowLoadMore,
    hasReplies

  }
};

export default useReplyLogic;
