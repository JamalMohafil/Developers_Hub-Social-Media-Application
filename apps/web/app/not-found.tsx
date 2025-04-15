import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-card rounded-lg border border-border shadow-xl overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-accent/10 animate-pulse"></div>
              </div>
              <div className="relative flex justify-center">
                <Search className="h-16 w-16 text-accent" strokeWidth={1.5} />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-foreground mb-2">
              Page Not Found
            </h2>
            <p className="text-muted-foreground">
              We couldn't find the page you're looking for.
            </p>
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
