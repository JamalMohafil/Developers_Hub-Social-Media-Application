"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type DeleteDialogProps = {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDelete: () => void;
};

export const DeleteDialog = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  handleDelete,
}: DeleteDialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        setIsDeleteDialogOpen(false);
      }
    };

    if (isDeleteDialogOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDeleteDialogOpen, setIsDeleteDialogOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDeleteDialogOpen(false);
      }
    };

    if (isDeleteDialogOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isDeleteDialogOpen, setIsDeleteDialogOpen]);

  // Manage body styles when dialog is open
  useEffect(() => {
    // Store original styles
    const originalOverflow = document.body.style.overflow;
    const originalPointerEvents = document.body.style.pointerEvents;

    if (isDeleteDialogOpen) {
      // Apply styles when dialog opens
      document.body.style.overflow = "hidden";
      // Ensure pointer events are NOT disabled
      document.body.style.pointerEvents = "";
    } else {
      // Restore original styles when dialog closes
      document.body.style.overflow = originalOverflow;
      document.body.style.pointerEvents = originalPointerEvents;
    }

    // Cleanup function to ensure styles are reset when component unmounts
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.pointerEvents = "";
    };
  }, [isDeleteDialogOpen]);

  if (!isDeleteDialogOpen) return null;

  // Use createPortal to render the dialog at the root level
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        ref={dialogRef}
        className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 animate-scaleIn"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="mb-4">
          <h2 id="alert-dialog-title" className="text-lg font-semibold">
            Are you sure?
          </h2>
          <p
            id="alert-dialog-description"
            className="mt-2 text-sm text-gray-500 dark:text-gray-400"
          >
            This action cannot be undone. This will permanently delete your
            post.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setIsDeleteDialogOpen(false);
            }}
            className="rounded-md border border-primary/20 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleDelete();
              setIsDeleteDialogOpen(false);
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
