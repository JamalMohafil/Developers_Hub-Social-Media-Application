"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Spinner from "./utils/Spinner";
import { LogOut } from "lucide-react";

export const ClientSignOutButton = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [signedOut, setSignedOut] = useState(false); // ✅ حالة جديدة لتحديد متى يتم إعادة التوجيه

  useEffect(() => {
    if (signedOut) {
      router.refresh();
    }
  }, [signedOut, router]);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      });
      if (response.ok) {
        setSignedOut(true);
        // window.location.reload();
      } else {
        console.error("فشل تسجيل الخروج");
        setLoading(false);
      }
    } catch (error) {
      console.error("خطأ أثناء تسجيل الخروج:", error);
    }
  };

  return (
    <button
      className={`flex w-full items-center gap-2 cursor-pointer px-4 py-2 text-sm 
          ${loading ? "bg-slate-700 cursor-not-allowed" : "text-white hover:bg-slate-700"} transition-colors
          `}
      onClick={handleSignOut}
      disabled={loading}
    >
      {loading ? <Spinner /> : <LogOut className="h-5 w-5 text-emerald-400" />}
      Sign out
    </button>
  );
};
