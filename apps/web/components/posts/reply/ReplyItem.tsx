"use client";

import { updateReplySchema, type Reply, type SessionType } from "@/lib/type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { KeyedMutator } from "swr";
import { handleCopy } from "@/lib/utils";
import { likeReplyAction } from "@/actions/posts/reply/like-reply.action";
import { updateReplyAction } from "@/actions/posts/reply/update-reply.action";
import Link from "next/link";
import { DeleteDialog } from "@/components/utils/DeleteDialog";
import { EditReplyDialog } from "./EditReplyDialog";
import ImageByChar from "@/components/utils/ImageByChar";
interface ReplyItemProps {
  reply: Reply;
  currentUserId?: string;
  mutateReplies: KeyedMutator<any>;
  session: SessionType | null;
  deleteReply: (replyId: string) => void;
  postId: string;
  commentId: string;
}

export default function ReplyItem({
  reply: initialReply,
  session,
  currentUserId,
  deleteReply,
  mutateReplies,
  postId,
  commentId,
}: ReplyItemProps) {
  const [reply, setReply] = useState(initialReply);
  const [likeReplyLoading, setLikeReplyLoading] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const handleLikeReply = async () => {
    if (!session) return toast.dark("You must be logged in to like a comment");

    // Save original state for error recovery
    const wasLiked = reply.isLiked === true;
    const currentCount = reply.likeCount;
    // Optimistically update UI

    setLikeReplyLoading(true);
    setReply((prev) => {
      return {
        ...prev,
        isLiked: !wasLiked,
        likeCount: !wasLiked
          ? prev.likeCount
            ? +1
            : 1
          : prev.likeCount
            ? prev.likeCount - 1
            : 0,
      };
    });
    // Try to update the server
    try {
      const result = await likeReplyAction(reply.id);

      if (!result || result.error || !result.action) {
        setReply((prev) => {
          return {
            ...prev,
            isLiked: wasLiked,
            likeCount: currentCount,
          };
        });
        throw new Error("Failed to update server");
      }

      setReply((prev) => {
        return {
          ...prev,
          isLiked: result.action === "liked" ? true : false,
          likeCount:
            result.action === "liked"
              ? prev.likeCount
                ? +1
                : 1
              : prev.likeCount
                ? prev.likeCount - 1
                : 0,
        };
      });
    } catch (error: any) {
      console.error("Error liking comment:", error);
      toast.dark(error.message || "Something went wrong");

      setReply((prev) => {
        return {
          ...prev,
          isLiked: wasLiked,
          likeCount: currentCount,
        };
      });
      return error;
    } finally {
      setLikeReplyLoading(false);
    }
  };
  const handleDeleteReply = async () => {
    await deleteReply(reply.id);
  };
  const formattedDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "some time ago";
    }
  };

  const isCurrentUserReply = reply.user?.id === currentUserId;
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");
  const [editReplyLoading, setEditReplyLoading] = useState<boolean>(false);
  const handleOpenEdit = () => {
    setIsEdit(true);
    setReplyText(reply.content); // استخدم محتوى الرد الحالي كقيمة أولية
  };

  const updateReply = async () => {
    if (!session) return toast.dark("You must be logged in to edit your reply");
    if (!replyText) return toast.dark("Reply cannot be empty");

    const dataToValidate = {
      content: replyText,
    };

    setEditReplyLoading(true);

    const validationResult = updateReplySchema.safeParse(dataToValidate);
    if (!validationResult.success || validationResult.error) {
      const errorMessages = validationResult.error.errors
        ?.map((err) => err.message)
        .join(", ");
      toast.dark(`${errorMessages}`);
      setEditReplyLoading(false);
      return;
    }

    // حفظ محتوى الرد الأصلي للاستعادة في حالة الخطأ
    const originalContent = reply.content;

    // تحديث متفائل للواجهة
    setReply((prev) => ({
      ...prev,
      content: replyText,
    }));

    try {
      const res = await updateReplyAction(
        postId,
        commentId,
        reply.id,
        replyText
      );

      if (res.status !== 200) {
        // استعادة الحالة الأصلية في حالة الخطأ
        setReply((prev) => ({
          ...prev,
          content: originalContent,
        }));

        return toast.dark(res.message);
      }

      toast.dark("Reply updated successfully");

      // يمكن استخدام SWR لإعادة التحقق من بيانات الردود إذا لزم الأمر
      mutateReplies((oldData: Reply[]) => {
        if (!oldData) return oldData;
        return oldData.map((replyData) => {
          if (replyData.id === reply.id) {
            return {
              ...replyData,
              content: originalContent,
            };
          }
          return replyData;
        }, false);
      });
    } catch (error: any) {
      console.error("Error updating reply:", error);
      // استعادة الحالة الأصلية في حالة الخطأ
      setReply((prev) => ({
        ...prev,
        content: originalContent,
      }));
      return toast.dark(error.message || "Something went wrong");
    } finally {
      setEditReplyLoading(false);
      setIsEdit(false);
    }
  };
  return (
    <div className="group animate-in fade-in-0 slide-in-from-top-2">
      <DeleteDialog
        handleDelete={handleDeleteReply}
        isDeleteDialogOpen={deleteDialogOpen}
        setIsDeleteDialogOpen={setDeleteDialogOpen}
      />
      <EditReplyDialog
        editReplyLoading={editReplyLoading}
        reply={reply}
        replyText={replyText}
        setReplyText={setReplyText}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        handleUpdateReply={updateReply}
      />
      <div className="flex gap-3 items-start">
        <Avatar className="h-7 w-7 border">
          <AvatarImage
            src={reply.user?.image}
            alt={reply.user?.name || "User"}
          />
          <ImageByChar isFallback={true} name={reply.user?.name} />
        </Avatar>

        <div className="flex flex-col flex-1 gap-1 min-w-0">
          <div className="flex flex-col rounded-2xl bg-muted px-3 py-2">
            <div className="flex justify-between items-center">
              <Link
                href={`/profile/${reply.user?.id}`}
                className="font-medium text-xs"
              >
                {reply.user?.name || "Anonymous User"}
                {isCurrentUserReply && (
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
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem
                    onClick={() => handleCopy(reply.content, copied, setCopied)}
                  >
                    Copy text
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  {isCurrentUserReply && (
                    <>
                      {" "}
                      <DropdownMenuItem onClick={handleOpenEdit}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem className="text-destructive">
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-xs mt-0.5 whitespace-pre-wrap break-words">
              {reply.content}
            </p>
          </div>

          <div className="flex items-center gap-3 px-1 text-xs">
            <span className="text-muted-foreground text-[10px]">
              {formattedDate(reply.createdAt)}
            </span>

            <button
              disabled={likeReplyLoading}
              className={`flex cursor-pointer items-center gap-1 text-[10px] font-medium ${likeReplyLoading && `opacity-50`} ${
                reply.isLiked
                  ? "text-rose-500"
                  : "text-muted-foreground hover:text-primary"
              } transition-colors`}
              onClick={handleLikeReply}
            >
              <Heart
                className={`h-3 w-3 ${reply.isLiked ? "fill-rose-500 stroke-rose-500" : ""}`}
              />
              {reply.likeCount || 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
