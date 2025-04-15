import { Loader2 } from "lucide-react";
import React from "react";

const Spinner = ({ className ,color="white"}: { className?: string ,color?:string}) => {
  return (
    <Loader2
      className={`animate-spin w-6 h-6 ${className}`}
      color={color}
    />
  );
};

export default Spinner;
