import { notFound } from "next/navigation";
import { getSession } from "../../../lib/session";
import ProfileInformation from "@/components/user/ProfileInformation";
import type { ProfileType, SessionType, SkillType } from "@/lib/type";
import type { Metadata, ResolvingMetadata } from "next";
import { getUserProfile } from "@/actions/user/project/get-user-profile.action";
import { FollowProvider } from "@/context/followContext";

// Define the params type for generateMetadata
type Props = {
  params: { id: string };
};

// Add generateMetadata function
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch user profile data
  const profileId = (await params).id;
  const userProfile = await getUserProfile(profileId);
  // Return default metadata if profile not found
  if (!userProfile) {
    return {
      title: "Profile Not Found",
      description: "The requested user profile could not be found.",
    };
  }

  // Extract user information
  const { user, bio, jobTitle, company, location, website } = userProfile;
  const userName = user?.name || "User";

  // Create description from bio or default text
  const description = bio
    ? bio.substring(0, 160)
    : `${userName}'s professional profile${jobTitle ? ` - ${jobTitle}` : ""}${company ? ` at ${company}` : ""}`;

  // Extract skills as keywords
  const skills =
    userProfile.skills && userProfile.skills.length > 0
      ? userProfile.skills.map((skill: SkillType) => skill.name).join(", ")
      : "";

  // Count projects

  // Create metadata object
  return {
    title: `${userName}'s Profile${jobTitle ? ` | ${jobTitle}` : ""}`,
    description,
    keywords: [
      "portfolio",
      "profile",
      userName,
      jobTitle || "",
      company || "",
      location || "",
      ...skills.split(", "),
    ].filter(Boolean),
    authors: [{ name: userName }],
    creator: userName,
    publisher: company || userName,
    openGraph: {
      title: `${userName}'s Profile${jobTitle ? ` | ${jobTitle}` : ""}`,
      description,
      type: "profile",
      images: [
        {
          url: user?.image || "/placeholder.svg",
          width: 1200,
          height: 630,
          alt: userName,
        },
      ],
      firstName: userName.split(" ")[0],
      lastName: userName.split(" ").slice(1).join(" ") || "",
      username: user?.username || "",
      gender: "unspecified",
    },
    twitter: {
      card: "summary_large_image",
      title: `${userName}'s Profile${jobTitle ? ` | ${jobTitle}` : ""}`,
      description,
      images: [user?.image || "/placeholder.svg"],
      creator: userName,
    },
    alternates: {
      canonical: `/profile/${profileId}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    category: "Profile",
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"
    ),
    other: {
      "profile:skills": String(userProfile.skills?.length || 0),
      "profile:location": location || "",
      "profile:website": website || "",
    },
  };
}

// صفحة البروفايل الديناميكية المسؤولة عن عرض ملف المستخدم بناءً على المعرف
export default async function DynamicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = (await getSession()) as SessionType | null;
  const id = (await params).id;
  const getProfile = await getUserProfile(id);
  const userProfile: ProfileType = getProfile;

  if (getProfile?.status === 404 || !getProfile || !userProfile)
    return notFound();

  const isOwnProfile = session?.user?.id === userProfile.userId;

  return (
    <div className="container mt-12 mx-auto py-8 max-w-4xl">
      {/* Profile Header */}
         <ProfileInformation
          userInfo={userProfile}
          session={session}
          isOwnProfile={isOwnProfile}
        />
     </div>
  );
}
