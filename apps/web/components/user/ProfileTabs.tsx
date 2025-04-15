"use client";
import { Suspense, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import type { ProfileType, SessionType } from "@/lib/type";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";
import ProjectsTab from "./projects/ProjectsTab";
import PostsTab from "../posts/PostsTab";

type Props = {
  userData: ProfileType;
  isOwnProfile: boolean;
  session: SessionType | null;
};

const ProfileTabs = ({ userData, isOwnProfile, session }: Props) => {
  // Get the available tab values
  const getAvailableTabs = () => {
    const tabs = ["overview", "projects", "posts"];
    if (isOwnProfile) tabs.push("settings");
    return tabs;
  };

  // State to track active tab and projects data
  const [activeTab, setActiveTab] = useState("overview");

  const availableTabs = getAvailableTabs();

  // Handle URL hash changes and initial load
  useEffect(() => {
    // Function to set tab based on hash
    const setTabFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && availableTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };

    // Set initial tab from URL if present
    setTabFromHash();

    // Listen for hash changes
    window.addEventListener("hashchange", setTabFromHash);

    // Cleanup
    return () => {
      window.removeEventListener("hashchange", setTabFromHash);
    };
  }, [availableTabs]);

  // Update URL hash when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without refreshing page
    window.history.pushState(null, "", `#${value}`);
  };
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="mb-4 bg-slate-800 border border-slate-700">
        <TabsTrigger
          value="overview"
          className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="projects"
          className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
        >
          Projects
        </TabsTrigger>
        <TabsTrigger
          value="posts"
          className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
        >
          Posts
        </TabsTrigger>
        {isOwnProfile && (
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
          >
            Settings
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="overview">
        <Suspense>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card className="bg-slate-900 border-slate-800 text-slate-300">
              <CardHeader>
                <CardTitle className="text-white">Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userData.contactEmail && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-slate-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <a
                      href={`mailto:${userData.contactEmail}`}
                      className="text-emerald-400 hover:underline overflow-hidden text-ellipsis"
                      title={userData.contactEmail}
                    >
                      {userData.contactEmail}
                    </a>
                  </div>
                )}

                {userData.website && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-slate-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      ></path>
                    </svg>
                    <a
                      href={
                        userData.website.startsWith("http")
                          ? userData.website
                          : `https://${userData.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline overflow-hidden text-ellipsis"
                      title={userData.website}
                    >
                      {userData.website}
                    </a>
                  </div>
                )}

                {userData.socialLinks && userData.socialLinks.length > 0 && (
                  <div className="mt-5">
                    <div className="flex gap-3 flex-wrap">
                      {userData.socialLinks.map((social) => {
                        if (!social.url) return;
                        return (
                          <Link
                            key={social.id}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-emerald-400 transition-colors"
                            title={social.platform}
                          >
                            {social.platform === "github" ? (
                              <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                              </svg>
                            ) : social.platform === "linkedin" ? (
                              <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                              </svg>
                            ) : social.platform === "facebook" ? (
                              <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                              </svg>
                            ) : social.platform === "instagram" ? (
                              <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                              </svg>
                            ) : social.platform === "youtube" ? (
                              <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                              </svg>
                            ) : social.platform === "tiktok" ? (
                              <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                              </svg>
                            ) : (
                              <div className="flex items-center justify-center w-6 h-6 bg-slate-700 rounded-full">
                                <span className="text-xs uppercase font-bold">
                                  {social.platform.slice(0, 1)}
                                </span>
                              </div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
                {userData?.socialLinks &&
                  userData?.socialLinks.length < 1 &&
                  !userData.website &&
                  !userData.contactEmail && (
                    <div className="text-slate-400 text-center py-8">
                      No social links or website found.
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="bg-slate-900 border-slate-800 text-slate-300">
              <CardHeader>
                <CardTitle className="text-white">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {userData.skills && userData.skills.length > 0 ? (
                    userData.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-3 py-1 bg-emerald-900/50 text-emerald-300 rounded-full text-sm"
                      >
                        {skill.name}
                      </span>
                    ))
                  ) : (
                    <div className="text-slate-400 text-center mx-auto py-6">
                      No skills found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </Suspense>
      </TabsContent>

      <TabsContent value="projects">
        <Suspense fallback={<ProjectsLoadingFallback />}>
          <ProjectsTab
            userData={userData!}
            isOwnProfile={isOwnProfile}
            activeTab={activeTab}
          />
        </Suspense>
      </TabsContent>
      <TabsContent value="posts">
        <Suspense fallback={<p>loading...</p>}>
          <PostsTab
            isOwnProfile={isOwnProfile}
            session={session}
            userData={userData}
            activeTab={activeTab}
          />
        </Suspense>
      </TabsContent>

      {isOwnProfile && (
        <TabsContent value="settings">
          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white">Account Settings</CardTitle>
              <CardDescription className="text-slate-400">
                Manage your account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2 text-white">Email Address</h3>
                <div className="flex items-center">
                  <input
                    type="email"
                    value={userData.user?.email || ""}
                    disabled
                    className="flex-1 p-2 border rounded-md mr-2 bg-slate-800 border-slate-700 text-slate-300"
                  />
                  <Button
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    Change
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-white">Password</h3>
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Change Password
                </Button>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-white">
                  Two-Factor Authentication
                </h3>
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-slate-700 pt-4">
              <Button
                variant="outline"
                className="text-red-400 hover:text-red-300 border-slate-700 hover:bg-slate-800"
              >
                Delete Account
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
};
const ProjectsLoadingFallback = () => {
  return (
    <Card className="overflow-hidden border border-slate-800 bg-slate-900 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
        <div>
          <CardTitle className="text-2xl font-bold text-white">
            Projects
          </CardTitle>
          <CardDescription className="text-slate-400">
            Loading projects...
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800"
            >
              <div className="h-48 w-full bg-slate-700 animate-pulse" />
              <div className="p-5">
                <div className="mb-2 h-7 w-3/4 bg-slate-700 animate-pulse" />
                <div className="mb-4 h-4 w-full bg-slate-700 animate-pulse" />
                <div className="mb-4 h-4 w-5/6 bg-slate-700 animate-pulse" />
                <div className="mb-4 flex flex-wrap gap-2">
                  <div className="h-6 w-16 rounded-full bg-slate-700 animate-pulse" />
                  <div className="h-6 w-20 rounded-full bg-slate-700 animate-pulse" />
                  <div className="h-6 w-14 rounded-full bg-slate-700 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileTabs;
