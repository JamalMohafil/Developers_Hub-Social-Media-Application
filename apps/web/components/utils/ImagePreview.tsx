"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AlertCircle } from "lucide-react";

interface ImagePreviewProps {
  url: string;
}

export function ImagePreview({ url }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!url) return;

    setIsLoading(true);
    setHasError(false);

    const img = new globalThis.Image();
    img.src = url;

    img.onload = () => {
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };
  }, [url]);

  if (!url) return null;

  if (hasError) {
    return (
      <div className="mt-4 p-4 border rounded-md bg-muted flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <p>Unable to load image. Please check the URL and try again.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 relative rounded-md overflow-hidden border">
      {isLoading ? (
        <div className="w-full h-[200px] bg-muted flex items-center justify-center">
          <div className="animate-pulse">Loading image...</div>
        </div>
      ) : (
        <div className="relative w-full h-[200px]">
          <Image
            src={url || "/placeholder.svg"}
            alt="Project image preview"
            fill
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
}
