import React from "react";
import { AvatarFallback } from "../ui/avatar";

type Props = {
  name?: string;
  className?: string;
  isFallback?: boolean;
};

const ImageByChar = ({ name, className, isFallback }: Props) => {
  return (
    <>
      {isFallback ? (
        <AvatarFallback
          className={`text-3xl font-bold bg-slate-700 text-emerald-400 ${className}`}
        >
          {(name || "U").charAt(0).toUpperCase()}
        </AvatarFallback>
      ) : (
        <div
          className={`text-3xl w-full h-full flex justify-center items-center font-bold bg-slate-700 text-emerald-400 ${className}`}
        >
          {(name || "U").charAt(0).toUpperCase()}
        </div>
      )}
    </>
  );
};

export default ImageByChar;
