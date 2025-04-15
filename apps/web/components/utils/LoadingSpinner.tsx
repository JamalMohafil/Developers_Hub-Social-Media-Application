export function LoadingSpinner() {
  return (
    <div className="flex justify-center">
      <div className="relative flex flex-col items-center">
        {/* Logo with optimized spinner */}
        <div className="mb-8 relative">
          {/* Outer spinning ring */}
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-t-emerald-400 border-r-emerald-400 border-b-transparent border-l-transparent animate-spin"></div>

          {/* Inner spinning ring with reverse animation */}
          <div
            className="absolute inset-0 w-12 h-12 rounded-full border-2 border-t-transparent border-r-transparent border-b-emerald-400 border-l-emerald-400"
            style={{
              animation: "spin 3s linear infinite reverse",
            }}
          ></div>
        </div>
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
}
