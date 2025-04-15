"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Comment } from "@/lib/type";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Edit Dialog Component
type EditDialogProps = {
  comment: Comment;
  commentText: string;
  setCommentText: React.Dispatch<React.SetStateAction<string>>;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  editCommentLoading: boolean;
  handleUpdateComment: (commentId: string) => void;
};

export const EditCommentDialog = ({
  comment,
  commentText,
  setCommentText,
  isEdit,
  setIsEdit,
  editCommentLoading,
  handleUpdateComment,
}: EditDialogProps) => {
  const [mounted, setMounted] = useState(false);

  // Handle component mounting for client-side rendering
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Manage body styles when dialog is open
  useEffect(() => {
    if (isEdit) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isEdit]);

  if (!mounted || !isEdit) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 flex items-center justify-center">
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="bg-slate-950 border border-slate-800 rounded-lg shadow-lg w-full max-w-[425px] max-h-[85vh] p-6 animate-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Dialog Header */}
          <div className="flex flex-col space-y-1.5 text-center mb-4">
            <h2 className="text-lg font-semibold text-white">
              Edit Your Comment
            </h2>
          </div>

          {/* Close Button */}
          <button
            className="absolute top-4 right-4 rounded-sm p-1 text-slate-400 hover:text-slate-200 focus:outline-none"
            onClick={() => setIsEdit(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          {/* Dialog Content */}
          <div className="py-4">
            <div className="flex flex-col items-center gap-4">
              <Label
                htmlFor="content"
                className="text-sm font-medium text-slate-300 text-right"
              >
                Content
              </Label>
           
              <Textarea
              autoFocus
              id="content"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[100px] resize-none bg-muted"
              />
            </div>
          </div>

          {/* Dialog Footer */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
            <button
              onClick={() => setIsEdit(false)}
              className="inline-flex items-center justify-center h-9 px-4 py-2 rounded-md text-sm font-medium text-slate-200 bg-transparent border border-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600"
            >
              Cancel
            </button>
            <button
              disabled={editCommentLoading}
              onClick={() => handleUpdateComment(comment.id)}
              className="inline-flex items-center justify-center h-9 px-4 py-2 rounded-md text-sm font-medium bg-primary text-white hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// // Delete Dialog Component
// type DeleteDialogProps = {
//   deleteDialogOpen: boolean;
//   setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
//   handleDeleteComment: () => void;
// };

// export const DeleteCommentDialog = ({
//   deleteDialogOpen,
//   setDeleteDialogOpen,
//   handleDeleteComment,
// }: DeleteDialogProps) => {
//   const [mounted, setMounted] = useState(false);

//   // Handle component mounting for client-side rendering
//   useEffect(() => {
//     setMounted(true);
//     return () => setMounted(false);
//   }, []);

//   // Manage body styles when dialog is open
//   useEffect(() => {
//     if (deleteDialogOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "";
//     }
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [deleteDialogOpen]);

//   if (!mounted || !deleteDialogOpen) return null;

//   return createPortal(
//     <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 flex items-center justify-center">
//       <div className="fixed inset-0 z-50 flex items-center justify-center">
//         <div
//           className="bg-slate-950 border border-slate-800 rounded-lg shadow-lg w-full max-w-[425px] max-h-[85vh] p-6 animate-in zoom-in-95"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Dialog Header */}
//           <div className="flex flex-col space-y-1.5 mb-4">
//             <h2 className="text-lg font-semibold text-white">Are you sure?</h2>
//             <p className="text-sm text-slate-400">
//               This action cannot be undone. This will permanently delete your
//               reply.
//             </p>
//           </div>

//           {/* Dialog Footer */}
//           <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
//             <button
//               onClick={() => setDeleteDialogOpen(false)}
//               className="inline-flex items-center justify-center h-9 px-4 py-2 rounded-md text-sm font-medium text-slate-200 bg-transparent border border-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={() => {
//                 handleDeleteComment();
//                 setDeleteDialogOpen(false);
//               }}
//               className="inline-flex items-center justify-center h-9 px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
//             >
//               Delete
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>,
//     document.body
//   );
// };
