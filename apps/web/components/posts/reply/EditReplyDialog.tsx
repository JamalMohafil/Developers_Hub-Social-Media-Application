"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Comment } from "@/lib/type";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type EditDialogProps = {
  reply: Comment;
  replyText: string;
  setReplyText: React.Dispatch<React.SetStateAction<string>>;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  editReplyLoading: boolean;
  handleUpdateReply: (replyId: string) => void;
};

export const EditReplyDialog = ({
  reply,
  replyText,
  setReplyText,
  isEdit,
  setIsEdit,
  editReplyLoading,
  handleUpdateReply,
}: EditDialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        setIsEdit(false);
      }
    };

    if (isEdit) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEdit, setIsEdit]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsEdit(false);
      }
    };

    if (isEdit) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isEdit, setIsEdit]);

  // Manage body styles when dialog is open
  useEffect(() => {
    // Store original styles
    const originalOverflow = document.body.style.overflow;
    const originalPointerEvents = document.body.style.pointerEvents;

    if (isEdit) {
      // Apply styles when dialog opens
      document.body.style.overflow = "hidden";
      // Ensure pointer events are NOT disabled
      document.body.style.pointerEvents = "";
    } else {
      // Restore original styles when dialog closes
      document.body.style.overflow = originalOverflow;
      document.body.style.pointerEvents = ""; // Always ensure pointer events are enabled when closing
    }

    // Cleanup function to ensure styles are reset when component unmounts
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.pointerEvents = ""; // Always ensure pointer events are enabled when unmounting
    };
  }, [isEdit]);

  if (!isEdit) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div
        ref={dialogRef}
        className="relative w-full z-50 max-w-[425px] rounded-lg bg-background border p-6 shadow-lg animate-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          onClick={() => setIsEdit(false)}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Dialog header */}
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-lg font-semibold leading-none">
            Edit Your Reply
          </h2>
        </div>

        {/* Dialog content */}
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <Label htmlFor="content" className="text-right">
              Content
            </Label>
            
            <Textarea
              placeholder="Add a comment..."
              id="content"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              autoFocus
              className="min-h-[100px] resize-none bg-muted"
            />
          </div>
        </div>

        {/* Dialog footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsEdit(false);
              // Ensure pointer events are restored when dialog closes
              setTimeout(() => {
                document.body.style.pointerEvents = "";
              }, 0);
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={editReplyLoading}
            onClick={() => {
              handleUpdateReply(reply.id);
              // Ensure pointer events are restored when dialog closes
              setTimeout(() => {
                document.body.style.pointerEvents = "";
              }, 0);
            }}
            type="submit"
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
