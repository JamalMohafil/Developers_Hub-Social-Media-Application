"use client";
import { Button } from "@/components/ui/button";
import { SortAsc, SortDesc } from "lucide-react";

interface SortToggleProps {
  sortOrder: string;
  onToggle: () => void;
}

export function SortToggle({ sortOrder, onToggle }: SortToggleProps) {
  return (
    <Button
      onClick={onToggle}
      variant="outline"
      className="flex items-center gap-2 border-border text-card-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <span>Sort: </span>
      {sortOrder === "desc" ? (
        <>
          <span>Newest First</span>
          <SortDesc className="h-4 w-4" />
        </>
      ) : (
        <>
          <span>Oldest First</span>
          <SortAsc className="h-4 w-4" />
        </>
      )}
    </Button>
  );
}
