"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { ClientSignOutButton } from "./SignOutButton";
import type { SessionType } from "../lib/type";
import ImageByChar from "./utils/ImageByChar";

export default function UserProfileDropdown({
  session,
}: {
  session: SessionType;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 hover:opacity-80 cursor-pointer transition-opacity group focus:outline-none"
      >
        <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center border-2 border-emerald-500 group-hover:border-emerald-400 transition-colors">
          {session.user.image ? (
            <Image
              src={session.user.image || "/placeholder.svg"}
              alt={session.user.name || session.user.username || "User"}
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            <ImageByChar className="text-sm" name={session?.user?.name as string} />
          )}
        </div>
        <div className="hidden lg:flex flex-col gap-0 items-start">
          <div className="flex items-center gap-2">
            <p className="font-medium text-left overflow-ellipsis overflow-hidden max-w-[130px] line-clamp-1 leading-tight text-white">
              {session.user.name || "no-name"}
            </p>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
          <p className="text-xs overflow-ellipsis overflow-hidden max-w-[130px] text-slate-400">
            @{session?.user?.username || "no-username"}
          </p>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-slate-800 border border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="py-2">
            {/* User info section */}
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-sm font-medium text-white truncate">
                {session.user.name || "No Name"}
              </p>
              <p className="text-xs text-slate-400 truncate mt-1">
                {session.user.email}
              </p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href={`/profile/${session.user.id}`}
                className="flex items-center px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="mr-3 h-4 w-4 text-slate-400" />
                Your Profile
              </Link>

              <Link
                href={`/profile/${session.user.id}#settings`}
                className="flex items-center px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="mr-3 h-4 w-4 text-slate-400" />
                Settings
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="mr-3 h-4 w-4 text-slate-400" />
                  Admin Dashboard
                </Link>
              )}
            </div>

            {/* Sign out button */}
            <div className="py-1 border-t border-slate-700">
              <ClientSignOutButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
