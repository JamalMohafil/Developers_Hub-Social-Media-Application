"use client";

import Image from "next/image";

const Loading = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md z-[999999]">
      <div className="relative flex flex-col items-center">
        {/* Logo with optimized spinner */}
        <div className="mb-8 relative">
          {/* Outer spinning ring */}
          <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-t-emerald-400 border-r-emerald-400 border-b-transparent border-l-transparent animate-spin"></div>

          {/* Inner spinning ring with reverse animation */}
          <div
            className="absolute inset-0 w-24 h-24 rounded-full border-2 border-t-transparent border-r-transparent border-b-emerald-400 border-l-emerald-400"
            style={{
              animation: "spin 3s linear infinite reverse",
            }}
          ></div>

          {/* Center logo with white background */}
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
            <div className="relative w-16 h-16">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Pulsing dots */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>
        </div>

        {/* Loading text */}
        <p className="mt-4 text-slate-300 text-sm font-medium animate-pulse">
          Loading...
        </p>
      </div>

      {/* Add keyframes for reverse spin animation */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;
