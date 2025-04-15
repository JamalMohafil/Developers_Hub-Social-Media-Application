"use client";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post, ProfileType, Project, SessionType } from "@/lib/type";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import { getProjects } from "@/actions/user/project/get-projects.action";
import { ProjectCard } from "../user/projects/ProjectCard";
import PostItem from "./PostItem";
import CreatePost from "./CreatePost";
import CreatePostDialog from "./CreatePostDialog";
import { getUserPosts } from "@/actions/posts/get-all-posts.action";

type Props = {
  isOwnProfile: boolean;
  userData: ProfileType;
  activeTab: string;
  session: SessionType | null;
};

// إضافة نوع البيانات لنتيجة الـ API
export interface PostsResponse {
  posts: Post[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

const PostsTab = ({ isOwnProfile, userData, activeTab, session }: Props) => {
  // تعديل حالة المشاريع لتشمل معلومات الصفحات
  const [posts, setPosts] = useState<PostsResponse>({
    posts: [],
    pagination: {
      total: 0,
      pages: 0,
      page: 1, // ابدأ من الصفحة 1 بدلاً من 0
      limit: 3,
      hasNext: false,
      hasPrevious: false,
    },
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fetchPosts = useCallback(async () => {
    if (activeTab === "posts") {
      setIsLoading(true);
      try {
        // جلب المشاريع ومعلومات الصفحات
        let response = await getUserPosts(
          userData.userId,
          posts.pagination.limit || 3,
          posts.pagination.page || 1
        );
        if (
          response &&
          response.posts.length < 1 &&
          response.pagination.pages > 1
        ) {
          setPosts((prev) => ({
            ...prev,
            pagination: {
              ...prev.pagination,
              page: prev.pagination.page - 1,
            },
          }));
          response = await getUserPosts(
            userData.userId,
            posts.pagination.limit,
            posts.pagination.page - 1
          );
        }
        if (response) {
          setPosts({
            posts: response.posts.map((post) => ({
              ...post,
              user: {
                name: userData?.user?.name || "",
                image: userData?.user?.image || "",
                id: userData?.userId || "",
              },
            })),
            pagination: response.pagination,
          });
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [activeTab, posts.pagination.limit, posts.pagination.page, userData.id]);
  // تحديث دالة جلب المشاريع
  useEffect(() => {
    fetchPosts();
  }, [
    activeTab,
    userData.id,
    posts.pagination.page,
    posts.pagination.limit,
    fetchPosts,
  ]);

  // دالة لتغيير الصفحة
  const handlePageChange = (newPage: number) => {
    setIsLoading(true);
    setPosts((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        page: newPage,
      },
    }));
    setIsLoading(false);
  };
  // معالجة تحديث المشروع

  const refreshPosts = async () => {
    setIsLoading(true);

    await fetchPosts();
    setIsLoading(false);
  };
  // إنشاء عناصر روابط الصفحات
  const renderPaginationLinks = () => {
    const { page, pages } = posts.pagination;
    const links = [];

    // إضافة الصفحات بناءً على العدد الإجمالي
    if (pages <= 5) {
      // إظهار كل الأرقام إذا كان العدد قليلاً
      for (let i = 1; i <= pages; i++) {
        links.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              className="hover:bg-primary"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
              isActive={page === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // إظهار الصفحات مع علامات الحذف للصفحات الكثيرة
      links.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
            isActive={page === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // إضافة الإليبسيس الأول إذا لزم الأمر
      if (page > 3) {
        links.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // إضافة الصفحات حول الصفحة الحالية
      const start = Math.max(2, page - 1);
      const end = Math.min(pages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        links.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
              isActive={page === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // إضافة الإليبسيس الثاني إذا لزم الأمر
      if (page < pages - 2) {
        links.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // إضافة الصفحة الأخيرة
      links.push(
        <PaginationItem key={pages}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(pages);
            }}
            isActive={page === pages}
          >
            {pages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return links;
  };
  const closeEditDialog = () => setIsAddDialogOpen(false);
  return (
    <Card className="overflow-hidden border border-slate-800 bg-slate-900 shadow-md">
      {isAddDialogOpen && (
        <CreatePostDialog
          isOpen={isAddDialogOpen}
          onClose={closeEditDialog}
          refreshPosts={refreshPosts}
          setIsOpen={setIsAddDialogOpen}
        />
      )}
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
        <div>
          <CardTitle className="text-2xl font-bold text-white">Posts</CardTitle>
          <CardDescription className="text-slate-400">
            {isOwnProfile ? "Your posts " : `${userData.user?.name}'s posts`}
          </CardDescription>
        </div>
        {isOwnProfile && (
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Post
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-2 sm:p-6 ">
        {isLoading ? (
          <div className="grid grid-cols-1  max-w-2xl mx-auto gap-6 ">
            {[1, 2, 3].map((i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {posts.posts && posts.posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:max-w-2xl mx-auto gap-6 ">
                {posts.posts.map((post) => (
                  <PostItem
                    hideFollow={true}
                    key={post.id}
                    refreshPosts={refreshPosts}
                    session={session}
                    post={post}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg bg-slate-800 py-16 text-center">
                <div className="mb-4 rounded-full bg-slate-700 p-4">
                  <Plus className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-white">
                  No posts yet
                </h3>
                <p className="max-w-md text-slate-400">
                  {isOwnProfile
                    ? "You haven't added any posts yet."
                    : "This user hasn't added any posts yet."}
                </p>
                {isOwnProfile && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="mt-4 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Post
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* إظهار مكون الصفحات فقط إذا كان هناك أكثر من صفحة واحدة */}
      {!isLoading && posts.pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-slate-800">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (posts.pagination.hasPrevious) {
                      handlePageChange(posts.pagination.page - 1);
                    }
                  }}
                  className={
                    !posts.pagination.hasPrevious
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>

              {renderPaginationLinks()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (posts.pagination.hasNext) {
                      handlePageChange(posts.pagination.page + 1);
                    }
                  }}
                  className={`${
                    !posts.pagination.hasNext
                      ? "pointer-events-none opacity-50"
                      : ""
                  } `}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </Card>
  );
};

const PostSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-xl px-4 border border-slate-700 bg-slate-800">
      <div className="flex items-center py-5">
        <Skeleton className="h-14 w-14 rounded-full bg-slate-700" />
        <div className="ml-4">
          <Skeleton className="mb-1 h-4 w-20 bg-slate-700" />
          <Skeleton className="h-3 w-16 bg-slate-700" />
        </div>
      </div>
      <Skeleton className="mb-2 h-5 w-3/4 bg-slate-700" />
      <Skeleton className="mb-2 h-12 w-full bg-slate-700" />
      <Skeleton className="h-44 w-full bg-slate-700" />
      <Skeleton className="mb-4 mt-4 h-4 w-1/4 bg-slate-700" />
      <div className="px-5">
        <div className="mb-4 flex flex-wrap justify-evenly gap-2">
          <Skeleton className="h-6 w-16 rounded-full bg-slate-700" />
          <Skeleton className="h-6 w-20 rounded-full bg-slate-700" />
          <Skeleton className="h-6 w-14 rounded-full bg-slate-700" />
        </div>
      </div>
    </div>
  );
};

export default PostsTab;
