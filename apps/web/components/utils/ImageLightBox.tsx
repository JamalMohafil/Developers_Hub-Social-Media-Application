"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function ImageLightbox({
  src,
  alt,
  width = 500,
  height = 800,
  priority = false,
}: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openLightbox = () => setIsOpen(true);
  const closeLightbox = () => setIsOpen(false);

  return (
    <>
      {/*  image with max height of 400px */}
      <div
        className="group relative cursor-pointer overflow-hidden rounded-xl"
        onClick={openLightbox}
      >
        <div className="relative max-h-[400px] overflow-hidden">
          <Image
            src={src || "/placeholder.svg"}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            className="object-cover object-top w-full max-h-[400px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div className="absolute bottom-4 right-4 rounded-full bg-white/20 p-2 backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100">
            <Eye className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Lightbox modal */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-all duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeLightbox}
      >
        <div
          className="relative max-h-[90vh] max-w-[90vw] overflow-auto rounded-lg bg-slate-900 p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70 z-10"
            onClick={closeLightbox}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="overflow-auto">
            <Image
              src={src || "/placeholder.svg"}
              alt={alt}
              width={width}
              height={height}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </>
  );
}
