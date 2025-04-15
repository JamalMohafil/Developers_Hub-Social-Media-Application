"use client";

import type { ProfileType, SessionType } from "@/lib/type";
import { formattedDate } from "@/lib/utils";
import {
  AlertCircle,
  Users,
  UserPlus,
  FileText,
  UserCheck,
  UserMinus,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { EditProfileButton } from "./EditProfileButton";
import FollowersModal from "./followers/FollowersModel";
import { followAction } from "@/actions/user/followers/follow.action";
import { redirect, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Spinner from "../utils/Spinner";
import { unfollowAction } from "@/actions/user/followers/unFollow.action";
import { Badge } from "../ui/badge";

type Props = {
  userProfile: ProfileType;
  session: SessionType | null;
  isOwnProfile: boolean;
  setUserProfile: React.Dispatch<React.SetStateAction<ProfileType>>;
};

const ProfileInfo = ({
  userProfile,
  session,
  isOwnProfile,
  setUserProfile,
}: Props) => {
  const [isFollowing, setIsFollowing] = useState(userProfile.isFollowing);
  const [followerCount, setFollowerCount] = useState(
    userProfile.followersCount || 0
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [followLoading, setFollowLoading] = useState(false);
  const handleFollow = async () => {
    if (!session || !session.user) {
      redirect("/signin");
    }

    setFollowLoading(true);
    setIsFollowing(true);
    try {
      const result = await followAction(userProfile.id);
      if (result.success) {
        toast.dark("Successfully followed user");
        setIsFollowing(true);
        setFollowerCount((prev) => prev + 1);
      } else {
        if (result.message === "Already unfollowing this user") {
          setIsFollowing(true);

          return toast.dark(result.message);
        }
        setIsFollowing(false);
        console.error("❌ Failed to follow user:", result.message);
        toast.dark(result.message || "Failed to follow user");
      }
    } catch (error) {
      setIsFollowing(false);
      console.error("❌ Follow action failed:", error);
      toast.dark("Something went wrong");
    } finally {
      setFollowLoading(false);
    }
  };
  const handleUnfollow = async () => {
    if (!session || !session.user) {
      redirect("/signin");
      return;
    }

    setFollowLoading(true);
    setIsFollowing(false);
    try {
      const result = await unfollowAction(userProfile.id);
      if (result.success) {
        toast.dark("Successfully unfollowed user");
        setIsFollowing(false);
        setFollowerCount((prev) => prev - 1);
      } else {
        if (result.message === "Already unfollowing this user") {
          setIsFollowing(false);

          return toast.dark(result.message);
        }
        setIsFollowing(true);
        console.error("❌ Failed to unfollow user:", result.message);
        toast.dark(result.message || "Failed to unfollow user");
      }
    } catch (error) {
      setIsFollowing(true);
      console.error("❌ Unfollow action failed:", error);
      toast.dark("Something went wrong");
    } finally {
      setFollowLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState<"followers" | "following">();
  const openFollowersModal = () => {
    setActiveTab("followers");
    setIsModalOpen(true);
  };

  const openFollowingModal = () => {
    setActiveTab("following");
    setIsModalOpen(true);
  };
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  return (
    <div className="flex-1 text-center md:text-left">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
        <div className="flex flex-col gap-1">
          {/* Name and Username Section */}
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-white">
              {userProfile?.user?.name}
            </h1>
            <div className="flex items-center mt-1">
              <span className="text-slate-400 text-sm font-medium">
                {userProfile?.user?.username || "@no-username"}
              </span>
              {session?.user?.emailVerified && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-900 text-emerald-300">
                  <svg
                    className="mr-1 h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Verification Alert - Only show for own profile */}
          {isOwnProfile && session?.user?.emailVerified === false && (
            <div className="bg-red-900/30 border border-red-800 rounded-md p-3 mb-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3 flex flex-col gap-2">
                  <h3 className="text-sm font-medium text-red-300">
                    Please verify your account to complete your profile
                  </h3>
                  <Link href="/email-verify">
                    <Button variant={"destructive"} size="sm">
                      Verify Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Stats Section - Followers, Following, Posts */}
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={openFollowersModal}
              className="flex items-center text-slate-300 hover:text-white transition-colors"
            >
              <Users className="w-4 h-4 mr-1 text-slate-400" />
              <span className="text-sm font-medium">{followerCount}</span>
              <span className="text-xs text-slate-400 ml-1">Followers</span>
            </button>
            <button
              onClick={openFollowingModal}
              className="flex items-center text-slate-300 hover:text-white transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-1 text-slate-400" />
              <span className="text-sm font-medium">
                {userProfile.followingCount || 0}
              </span>
              <span className="text-xs text-slate-400 ml-1">Following</span>
            </button>
            <div className="flex items-center text-slate-300">
              <FileText className="w-4 h-4 mr-1 text-slate-400" />
              <span className="text-sm font-medium">
                {userProfile.postsCount || 0}
              </span>
              <span className="text-xs text-slate-400 ml-1">Posts</span>
            </div>
          </div>

          {/* Bio Section */}
          <div className="flex flex-col">
            <p
              className={`text-slate-300 mb-2 max-w-xl ${!isBioExpanded && `line-clamp-3`}  whitespace-pre-line break-words leading-relaxed`}
            >
              {userProfile.bio?.trim() || "No bio"}
            </p>
            {userProfile.bio &&
              userProfile.bio?.trim() &&
              userProfile?.bio?.length > 100 && (
                <Button
                  onClick={() => setIsBioExpanded(!isBioExpanded)}
                  variant="outline"
                  className="flex items-center w-max h-max cursor-pointer gap-2 px-3 py-1 bg-secondary/10 text-primary text-xs border border-secondary/20"
                >
                  {isBioExpanded ? "Show Less" : "Show More"}
                </Button>
              )}
          </div>
        </div>

        {/* Edit Profile Button or Follow/Unfollow Buttons */}
        <div className="mt-3 md:mt-0">
          {isOwnProfile ? (
            <EditProfileButton
              setUserProfile={setUserProfile}
              username={session?.user.username || ""}
              name={session?.user.name || ""}
              accessToken={session?.accessToken || ""}
              userProfile={userProfile}
            />
          ) : isFollowing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnfollow}
              disabled={followLoading}
              className="flex items-center gap-1 bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
            >
              <UserMinus className="h-4 w-4" />{" "}
              {followLoading ? (
                <>
                  <Spinner /> Following...
                </>
              ) : (
                "Unfollow"
              )}
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleFollow}
              disabled={followLoading}
              className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-600 text-white"
            >
              <UserCheck className="h-4 w-4" />
              {followLoading ? (
                <>
                  <Spinner /> Unfollowing...
                </>
              ) : (
                "Follow"
              )}
            </Button>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div className="flex items-center px-4 text-slate-300 border border-slate-700 rounded-md p-2 bg-slate-800">
          <svg
            className="w-5 h-5 mr-2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            ></path>
          </svg>
          <div>
            <span className="text-sm font-medium">
              {userProfile?.jobTitle || "No job"}
            </span>
            {userProfile.company && (
              <span className="text-xs block text-slate-400">
                at {userProfile.company}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center px-4 text-slate-300 border border-slate-700 rounded-md p-2 bg-slate-800">
          <svg
            className="w-5 h-5 mr-2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            ></path>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </svg>
          <span className="text-sm">{userProfile.location || "Unknown"}</span>
        </div>

        <div className="flex items-center px-4 text-slate-300 border border-slate-700 rounded-md p-2 bg-slate-800">
          <svg
            className="w-5 h-5 mr-2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          <span className="text-sm">
            Joined {formattedDate(userProfile.createdAt)}
          </span>
        </div>
      </div>

      {/* Followers/Following Modal */}
      <FollowersModal
        followersCount={followerCount || 0}
        followingCount={userProfile.followingCount || 0}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileId={userProfile.id}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default ProfileInfo;
