// components/followers/FollowersModal.tsx

"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { BACKEND_URL } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageByChar from "@/components/utils/ImageByChar";

type UserType = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
};

type FollowersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  activeTab?: "followers" | "following";
  followersCount: number;
  followingCount: number;
  setActiveTab: React.Dispatch<
    React.SetStateAction<"followers" | "following" | undefined>
  >;
};

export default function FollowersModal({
  isOpen,
  onClose,
  profileId,
  activeTab = "followers",
  followersCount,
  followingCount,
  setActiveTab,
}: FollowersModalProps) {
  const [followers, setFollowers] = useState<UserType[]>([]);
  const [following, setFollowing] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 1;

  // Update hasMore based on current data and counts
  const updateHasMore = () => {
    if (activeTab === "followers") {
      // Check if we've loaded all followers or if the last API call returned fewer items than the limit
      setHasMore(followers.length < followersCount);
    } else {
      // Check if we've loaded all following or if the last API call returned fewer items than the limit
      setHasMore(following.length < followingCount);
    }
  };

  const fetchFollowers = async (currentPage = page) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/users/${profileId}/followers?limit=${limit}&page=${currentPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (data && Array.isArray(data)) {
        if (currentPage === 1) {
          setFollowers(data);
        } else {
          setFollowers((prev) => [...prev, ...data]);
        }

        // If we got fewer results than the limit or reached the total count, no more to load
        const noMoreData =
          data.length < limit || currentPage * limit >= followersCount;
        setHasMore(!noMoreData);
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async (currentPage = page) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/users/${profileId}/following?limit=${limit}&page=${currentPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (data && Array.isArray(data)) {
        if (currentPage === 1) {
          setFollowing(data);
        } else {
          setFollowing((prev) => [...prev, ...data]);
        }

        // If we got fewer results than the limit or reached the total count, no more to load
        const noMoreData =
          data.length < limit || currentPage * limit >= followingCount;
        setHasMore(!noMoreData);
      }
    } catch (error) {
      console.error("Error fetching following:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load when modal opens or tab changes
  useEffect(() => {
    if (isOpen) {
      if (activeTab === "followers") {
        fetchFollowers(1);
      } else {
        fetchFollowing(1);
      }
      setPage(1);
    }
  }, [isOpen, activeTab, profileId]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as "followers" | "following");
    setPage(1);
    setHasMore(true);
  };

  // Load more data
  const loadMore = () => {
    const nextPage = page + 1;

    if (activeTab === "followers" && followers.length < followersCount) {
      setPage(nextPage);
      fetchFollowers(nextPage);
    } else if (activeTab === "following" && following.length < followingCount) {
      setPage(nextPage);
      fetchFollowing(nextPage);
    }
  };

  // Update hasMore whenever followers or following lists change
  useEffect(() => {
    updateHasMore();
  }, [followers, following, activeTab]);

  const renderUserList = (users: UserType[]) => {
    if (users.length === 0 && !loading) {
      return (
        <div className="text-center py-8 text-slate-400">No users found</div>
      );
    }

    return (
      <>
        <div className="space-y-3">
          {users.map((user) => (
            <Link
              href={`/profile/${user.id}`}
              key={user.id}
              onClick={onClose}
              className="flex items-center p-3 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                <ImageByChar name={user.name as string} isFallback={true} />
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-white">{user.name}</p>
                <p className="text-sm text-slate-400">
                  @{user.username || "no-username"}
                </p>
              </div>
            </Link>
          ))}
        </div>
        {hasMore && (
          <div className="text-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMore}
              disabled={loading}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Show More"
              )}
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>
            {activeTab === "followers" ? "Followers" : "Following"}
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-2 mb-4 bg-slate-800">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="followers" className="mt-2">
            {renderUserList(followers)}
          </TabsContent>
          <TabsContent value="following" className="mt-2">
            {renderUserList(following)}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
