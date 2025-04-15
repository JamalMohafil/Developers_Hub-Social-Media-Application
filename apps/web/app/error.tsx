"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Error() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-card rounded-lg shadow-xl overflow-hidden border border-border">
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-card-foreground mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-muted-foreground">
              We apologize for the inconvenience. Please try again later.
            </p>
            <div className="mt-6 flex justify-center">
              <svg
                className="h-24 w-24 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
