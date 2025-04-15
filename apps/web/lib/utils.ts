
import { clsx, type ClassValue } from "clsx";
import { toast } from "react-toastify";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeValue(value: string | null): string | null {
  return value && value !== "null" && value.trim() !== "" ? value : null;
}
export const formattedDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const handleCopy = (
  text: string,
  copied?: boolean,
  setCopied?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (copied === true) return;
  navigator.clipboard.writeText(text);
  toast.dark("Text copied");
  if (setCopied) {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  }
};
