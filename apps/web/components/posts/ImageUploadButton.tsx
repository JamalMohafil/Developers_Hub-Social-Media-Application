"use client";

import type React from "react";

import { ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface ImageUploadButtonProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export function ImageUploadButton({
  onUpload,
  isUploading,
}: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground relative overflow-hidden group"
        onClick={triggerFileInput}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <ImagePlus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
        )}
        Photo
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onUpload}
        disabled={isUploading}
      />
    </>
  );
}
