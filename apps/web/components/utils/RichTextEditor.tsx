"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
// نستخدم دالة التحقق من نوع التحديد بدلاً من استيراد الكلاس

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  X,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Node } from "@tiptap/pm/model";

// مكونات الواجهة
const Button = ({
  children,
  onClick,
  className = "",
  active = false,
  ...props
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  active?: boolean;
  [key: string]: any;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 border rounded-md text-sm flex items-center justify-center ${
        active ? " border-slate-300" : " hover:bg-slate-950/20"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50  flex items-center justify-center">
      <div className="bg-primary-foreground rounded-lg shadow-lg max-w-md w-full p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white cursor-pointer hover:text-gray-300"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Input = ({
  value,
  onChange,
  placeholder,
  onKeyDown,
  ...props
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  [key: string]: any;
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      className="w-full border border-gray-300 rounded-md p-2 text-sm"
      {...props}
    />
  );
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  noImage?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  noImage = false,
}: RichTextEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDialogAction, setLinkDialogAction] = useState<"add" | "edit">(
    "add"
  );
  const [imageUrl, setImageUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      ...(noImage === false
        ? [
            Image.configure({
              HTMLAttributes: {
                class: "editor-image",
              },
            }),
          ]
        : []),

      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
          rel: "noopener noreferrer",
        },
      }),
      Placeholder.configure({
        placeholder: "Write something...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    // إضافة مراقبة للتحديد
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const handleImageInsert = (e?: React.FormEvent) => {
    // منع الإرسال الافتراضي للنموذج
    if (e) e.preventDefault();

    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setIsImageDialogOpen(false);
    }
  };

  const handleLinkInsert = (e?: React.FormEvent) => {
    // منع الإرسال الافتراضي للنموذج
    if (e) e.preventDefault();

    if (linkUrl && editor) {
      // عند إضافة رابط، نحتفظ بالنص المحدد ونضيف الرابط عليه
      if (linkDialogAction === "add") {
        // يستخدم setLink للنص المحدد
        editor.chain().focus().setLink({ href: linkUrl }).run();
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .updateAttributes("link", {
            href: linkUrl,
          })
          .run();
      }
      setLinkUrl("");
      setIsLinkDialogOpen(false);
    }
  };

  const openLinkDialog = (e: React.MouseEvent) => {
    // منع الإرسال الافتراضي للنموذج
    e.preventDefault();

    // فحص إذا كان هناك نص محدد
    const selection = editor.state.selection;
    const isTextSelected = !selection.empty;

    // إذا كان هناك رابط قائم، نستخدم بياناته
    const href = editor.getAttributes("link").href;
    if (href) {
      setLinkUrl(href);
      setLinkDialogAction("edit");
    } else {
      setLinkUrl("");
      // إذا لم يكن هناك نص محدد، نعرض رسالة للمستخدم
      if (!isTextSelected) {
        alert("Please select some text first");
        return;
      }
      setLinkDialogAction("add");
    }
    setIsLinkDialogOpen(true);
  };

  return (
    <div
      className={`rich-text-editor ${isFullscreen ? "fixed pt-16 inset-0 z-40 bg-slate-900" : ""}`}
    >
      <div className="border rounded-md overflow-hidden">
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-800 border-b">
          <div className="flex items-center gap-1">
            <Button
              active={editor.isActive("bold")}
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleBold().run();
              }}
              title="Bold"
            >
              <Bold size={18} />
            </Button>
            <Button
              active={editor.isActive("italic")}
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleItalic().run();
              }}
              title="Italic"
            >
              <Italic size={18} />
            </Button>
            <Button
              active={editor.isActive("underline")}
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleUnderline().run();
              }}
              title="Underline"
            >
              <UnderlineIcon size={18} />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              active={editor.isActive("heading", { level: 1 })}
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level: 1 }).run();
              }}
              title="Headline 1"
            >
              <Heading1 size={18} />
            </Button>
            <Button
              active={editor.isActive("heading", { level: 2 })}
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level: 2 }).run();
              }}
              title="Headline 2"
            >
              <Heading2 size={18} />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              active={editor.isActive({ textAlign: "left" })}
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().setTextAlign("left").run();
              }}
              title="Align Left"
            >
              <AlignLeft size={18} />
            </Button>
            <Button
              active={editor.isActive({ textAlign: "center" })}
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().setTextAlign("center").run();
              }}
              title="Align Center"
            >
              <AlignCenter size={18} />
            </Button>
            <Button
              active={editor.isActive({ textAlign: "right" })}
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().setTextAlign("right").run();
              }}
              title="Align Right"
            >
              <AlignRight size={18} />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              active={editor.isActive("bulletList")}
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleBulletList().run();
              }}
              title="List"
            >
              <List size={18} />
            </Button>
            <Button
              active={editor.isActive("orderedList")}
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleOrderedList().run();
              }}
              title="Ordered List"
            >
              <ListOrdered size={18} />
            </Button>
          </div>

          <Button
            onClick={openLinkDialog}
            active={editor.isActive("link")}
            title="Link"
          >
            <LinkIcon size={18} />
          </Button>

          {noImage === false && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                setIsImageDialogOpen(true);
              }}
              title="Image"
            >
              <ImageIcon size={18} />
            </Button>
          )}

          <Button
            onClick={(e) => {
              e.preventDefault();
              setIsFullscreen(!isFullscreen);
            }}
            className="ml-auto"
            title={isFullscreen ? "Minimize" : "Maximize"}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </Button>
        </div>

        <div
          className={`editor-content-container ${isFullscreen ? "h-[calc(100vh-60px)]" : ""}`}
        >
          <EditorContent
            editor={editor}
            className="prose max-w-none p-4 min-h-[300px] focus:outline-none"
          />
        </div>
      </div>

      {/* مربع حوار الروابط */}
      <Dialog
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        title={linkDialogAction === "add" ? "Add a link" : "Edit link"}
      >
        <div className="flex flex-col gap-3">
          <Input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={(e) => e.key === "Enter" && handleLinkInsert()}
          />
          <div className="flex justify-between">
            {linkDialogAction === "edit" && (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .unsetLink()
                    .run();
                  setIsLinkDialogOpen(false);
                }}
                className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              >
                Delete link
              </Button>
            )}
            <Button
              onClick={handleLinkInsert}
              className="ml-auto bg-primary/10 cursor-pointer text-primary font-medium hover:bg-primary/30"
            >
              {linkDialogAction === "add" ? "Add " : "Update"}{" "}
              <CornerDownLeft size={16} className="mx-1" />
            </Button>
          </div>
        </div>
      </Dialog>

      {/* مربع حوار الصور */}
      <Dialog
        isOpen={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        title="Add Image"
      >
        <div className="flex flex-col gap-3">
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            onKeyDown={(e) => e.key === "Enter" && handleImageInsert()}
          />
          <Button
            onClick={handleImageInsert}
            className="ml-auto bg-primary/10 cursor-pointer text-primary font-medium hover:bg-primary/30"
          >
            Add Image <CornerDownLeft size={16} className="mx-1" />
          </Button>
        </div>
      </Dialog>

      <style jsx global>{`
        .rich-text-editor {
          font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .editor-content-container {
          overflow-y: auto;
        }

        .ProseMirror {
          outline: none;
          min-height: 300px;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .editor-image {
          display: block;
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
          border-radius: 4px;
          cursor: pointer;
        }

        .ProseMirror .editor-image.ProseMirror-selectednode {
          outline: 3px solid #68cef8;
        }

        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1rem;
        }

        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1rem;
        }
      `}</style>
    </div>
  );
}
