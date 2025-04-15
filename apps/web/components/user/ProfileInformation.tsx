"use client";

import { lazy, useState } from "react";
import type { ProfileType, SessionType } from "@/lib/type";
import ProfileTabs from "./ProfileTabs";
import ProfileInfo from "./ProfileInfo";
import ProfileImage from "./ProfileImage";
const BackgroundAnimation = lazy(
  () => import("@/components/ui/background-animation")
);
const ProfileInformation = ({
  userInfo,
  session,
  isOwnProfile,
}: {
  userInfo: ProfileType;
  session: SessionType | null;
  isOwnProfile: boolean;
}) => {
  const [userProfile, setUserProfile] = useState(userInfo);
  return (
    <>
      <BackgroundAnimation />
      <div className="bg-slate-900 rounded-lg shadow-md border border-slate-800 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Image */}
          <ProfileImage userProfile={userProfile} isOwnProfile={isOwnProfile} />

          {/* Profile Info */}
          <ProfileInfo
            setUserProfile={setUserProfile}
            userProfile={userProfile}
            isOwnProfile={isOwnProfile}
            session={session}
          />
        </div>
      </div>

      {/* Content Tabs */}
      <ProfileTabs
        userData={userProfile}
        isOwnProfile={isOwnProfile}
        session={session}
      />
    </>
  );
};

export default ProfileInformation;
