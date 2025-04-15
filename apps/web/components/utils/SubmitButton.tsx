"use client";
import type React from "react";

import { Button } from "../ui/button";
import Spinner from "./Spinner";

export function SubmitButton({
  children,
  pending,
  className,
}: {
  children: React.ReactNode;
  pending: boolean;
  className?: string;
}) {
  return (
    <Button
      disabled={pending}
      className={`w-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-medium py-2.5 h-11 ${className || ""}`}
    >
      {pending ? <Spinner /> : children}
    </Button>
  );
}
