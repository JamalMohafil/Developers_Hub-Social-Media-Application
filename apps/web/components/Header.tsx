"use client";

import Link from "next/link";
import { MessageSquare, Menu, X, Code } from "lucide-react";
import type { SessionType } from "../lib/type";
import { useState } from "react";
import UserProfileDropdown from "./UserProfileDropdown";

import NotificationsHeader from "./NotificationsHeader";

export default function Header({
  serverSession,
}: {
  serverSession?: SessionType | null;
}) {
  const session = serverSession;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <div className="bg-slate-900 text-white shadow-xl border-b border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-emerald-500 p-1.5 rounded-md">
                  <Code className="h-5 w-5 text-slate-900" />
                </div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 text-transparent bg-clip-text">
                  Developers Hub
                </span>
              </Link>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center">
              <div className="flex rounded-full bg-slate-800 p-1 mx-4">
                <Link
                  href="/"
                  className="px-4 py-2 text-sm rounded-full hover:bg-slate-700 font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/posts"
                  className="px-4 py-2 text-sm rounded-full hover:bg-slate-700 font-medium transition-colors"
                >
                  Posts
                </Link>
                <Link
                  href="/projects"
                  className="px-4 py-2 text-sm rounded-full hover:bg-slate-700 font-medium transition-colors"
                >
                  Projects
                </Link>
                <Link
                  href="/groups"
                  className="px-4 py-2 text-sm rounded-full hover:bg-slate-700 font-medium transition-colors"
                >
                  Groups
                </Link>
              </div>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {session && session.user ? (
                <>
                  {/* Notifications */}
                  <NotificationsHeader session={session} />

                  {/* Messages */}
                  {/* <button className="p-2 cursor-pointer rounded-full hover:bg-slate-800 transition-colors relative">
                    <MessageSquare className="h-5 w-5" />
                    <span className="absolute top-0 right-0 h-4 w-4 bg-emerald-500 rounded-full text-xs flex items-center justify-center border-2 border-slate-900">
                      5
                    </span>
                  </button> */}

                  {/* User Profile Dropdown */}
                  <div className="flex items-center pl-2 border-l border-slate-700">
                    <UserProfileDropdown session={session} />
                  </div>
                </>
              ) : (
                <Link
                  href="/signin"
                  className="px-4 py-2 bg-emerald-500 text-slate-900 rounded-md font-semibold hover:bg-emerald-400 transition-colors"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-md hover:bg-slate-800 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-b border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-white font-medium hover:bg-slate-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/posts"
              className="block px-3 py-2 rounded-md text-white font-medium hover:bg-slate-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              posts
            </Link>
            <Link
              href="/projects"
              className="block px-3 py-2 rounded-md text-white font-medium hover:bg-slate-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              projects
            </Link>
            <Link
              href="/groups"
              className="block px-3 py-2 rounded-md text-white font-medium hover:bg-slate-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Groups
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
