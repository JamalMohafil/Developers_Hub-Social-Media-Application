"use client";

import { useState } from "react";
import { User, Share2, LinkIcon, Check, Copy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";

interface ShareButtonsProps {
  projectId: string;
  profileId: string;
}

export function ShareButtons({ projectId, profileId }: ShareButtonsProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      toast.success(`${type} URL has been copied to clipboard.`);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(null);
      }, 2000);
    });
  };

  const getProjectUrl = () => {
    return `${window.location.origin}/projects/${projectId}`;
  };

  const getProfileUrl = () => {
    return `${window.location.origin}/profile/${profileId}`;
  };

  return (
    <div className="grid mt-6 grid-cols-2 gap-3">
      <Button
        variant="outline"
        asChild
        className="w-full border-emerald-700/30 bg-slate-800 text-slate-300 hover:bg-emerald-900/20 hover:text-emerald-400 transition-colors"
      >
        <Link href={`/profile/${profileId}`}>
          <User className="mr-2 h-4 w-4" />
          View Profile
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full border-emerald-700/30 bg-slate-800 text-slate-300 hover:bg-emerald-900/20 hover:text-emerald-400 transition-colors"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 p-2 bg-slate-800 border border-slate-700 shadow-lg rounded-lg"
        >
          <DropdownMenuItem
            onClick={() => copyToClipboard(getProjectUrl(), "Project")}
            className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-emerald-900/20 rounded-md transition-colors text-slate-300 hover:text-emerald-400"
          >
            {copied === "Project" ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <LinkIcon className="h-4 w-4" />
            )}
            <span>Copy project URL</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => copyToClipboard(getProfileUrl(), "Profile")}
            className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-emerald-900/20 rounded-md transition-colors text-slate-300 hover:text-emerald-400"
          >
            {copied === "Profile" ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>Copy user profile URL</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
