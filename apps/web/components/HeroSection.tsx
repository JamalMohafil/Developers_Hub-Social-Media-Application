import Image from "next/image";
import React, { Suspense } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
const BackgroundAnimation = dynamic(
  () => import("@/components/ui/background-animation")
);
type Props = {};

const HeroSection = (props: Props) => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background to-card z-0"></div>
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* تحميل الخلفية المتحركة بشكل متأخر */}
      <Suspense fallback={null}>
        <BackgroundAnimation />
      </Suspense>

      <div className="relative z-10 container mx-auto px-4 py-20 md:py-28">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="inline-block p-2 bg-muted/30 rounded-xl border border-border mb-4">
            <div className="flex items-center space-x-2 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-sm font-medium text-primary">
                Developers Hub Community
              </span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl">
            Where <span className="text-primary">Developers</span> Connect,
            Collaborate, and Grow
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Join a thriving community of developers sharing knowledge, projects,
            and opportunities in a supportive environment.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/posts">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Join Community <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/projects">
              <Button
                size="lg"
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10"
              >
                Explore Projects
              </Button>
            </Link>
          </div>

          <div className="pt-6 flex items-center justify-center gap-6 mt-2">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center overflow-hidden"
                >
                  <Image
                    src={`/placeholder.svg`}
                    width={40}
                    height={40}
                    alt={`Developer ${i}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
              <div className="h-10 w-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium text-primary">
                +2K
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Join over{" "}
              <span className="font-medium text-foreground">2,000+</span>{" "}
              developers
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default HeroSection;
