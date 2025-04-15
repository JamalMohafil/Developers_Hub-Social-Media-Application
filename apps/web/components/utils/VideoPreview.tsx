"use client";

import { useState, useEffect } from "react";

interface VideoPreviewProps {
  url: string;
}

export function VideoPreview({ url }: VideoPreviewProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setEmbedUrl(null);
      return;
    }

    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId = "";
      if (url.includes("youtube.com/watch?v=")) {
        videoId = url.split("v=")[1]?.split("&")[0] || "";
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
      }

      if (videoId) {
        setEmbedUrl(`https://www.youtube.com/embed/${videoId}`);
      }
    }
    // Vimeo
    else if (url.includes("vimeo.com")) {
      const vimeoId = url.split("vimeo.com/")[1]?.split("?")[0] || "";
      if (vimeoId) {
        setEmbedUrl(`https://player.vimeo.com/video/${vimeoId}`);
      }
    }
    // Facebook
    else if (url.includes("facebook.com/watch")) {
      setEmbedUrl(
        `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0`
      );
    }
    // Google Drive
    else if (url.includes("drive.google.com")) {
      let driveId = "";
      if (url.includes("/file/d/")) {
        driveId = url.split("/file/d/")[1]?.split("/")[0] || "";
      }

      if (driveId) {
        setEmbedUrl(`https://drive.google.com/file/d/${driveId}/preview`);
      }
    }
  }, [url]);

  if (!embedUrl) return null;

  return (
    <div className="mt-4 rounded-md overflow-hidden border">
      <iframe
        src={embedUrl}
        width="100%"
        height="425"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="border-0"
      ></iframe>
    </div>
  );
}
