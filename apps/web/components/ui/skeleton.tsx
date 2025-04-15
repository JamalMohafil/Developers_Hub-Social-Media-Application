import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export function ReplySkeletons() {
  return (
    <>
      {[1, 2].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="flex gap-3 items-start">
            {/* Avatar skeleton */}
            <div className="h-7 w-7 rounded-full bg-muted" />

            <div className="flex-1 space-y-2">
              {/* Comment bubble skeleton */}
              <div className="flex flex-col rounded-2xl bg-muted/60 px-3 py-2.5">
                {/* Username skeleton */}
                <div className="w-20 h-3 bg-muted rounded-full" />

                {/* Content skeleton - multiple lines */}
                <div className="space-y-1.5 mt-1.5">
                  <div className="w-full h-2.5 bg-muted rounded-full" />
                  <div className="w-4/5 h-2.5 bg-muted rounded-full" />
                </div>
              </div>

              {/* Action buttons skeleton */}
              <div className="flex items-center gap-3 px-1">
                <div className="w-16 h-2 bg-muted rounded-full" />
                <div className="w-8 h-2 bg-muted rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function CommentSkeletons() {
  return (
    <div className="space-y-4 divide-y">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse py-4 first:pt-0">
          <div className="flex gap-3 items-start">
            {/* Avatar skeleton */}
            <div className="h-8 w-8 rounded-full bg-muted" />

            <div className="flex-1 space-y-2">
              {/* Comment bubble skeleton */}
              <div className="flex flex-col rounded-2xl bg-muted/60 px-4 py-3">
                {/* Username skeleton */}
                <div className="w-24 h-3.5 bg-muted rounded-full" />

                {/* Content skeleton - multiple lines */}
                <div className="space-y-2 mt-2">
                  <div className="w-full h-3 bg-muted rounded-full" />
                  <div className="w-full h-3 bg-muted rounded-full" />
                  <div className="w-3/4 h-3 bg-muted rounded-full" />
                </div>
              </div>

              {/* Action buttons skeleton */}
              <div className="flex items-center gap-3 px-1">
                <div className="w-20 h-2.5 bg-muted rounded-full" />
                <div className="w-10 h-2.5 bg-muted rounded-full" />
                <div className="w-10 h-2.5 bg-muted rounded-full" />
              </div>

              {/* Reply button skeleton */}
          
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
