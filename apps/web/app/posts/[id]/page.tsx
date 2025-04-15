import { getPostDetails } from "@/actions/posts/get-all-posts.action";

import PostDetailsPage from "@/components/posts/PostDetailsPage";
import BackgroundAnimation from "@/components/ui/background-animation";
import { FollowProvider } from "@/context/followContext";

import { getSession } from "@/lib/session";

import React from "react";

type Props = {};

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await getSession();
  const currentPost = await getPostDetails(id);

   return (
    <div className="pt-12">
      <BackgroundAnimation />
         <PostDetailsPage currentPost={currentPost} session={session} />
     </div>
  );
};

export default page;
