"use client";
import { Post, SessionType } from "@/lib/type";
import PostItem from "./PostItem";
import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { LoadingSpinner } from "../utils/LoadingSpinner";

type PostListProps = {
  posts: Post[];
  session: SessionType | null;
  sortOrder?: string | null;
  selectedCategory?: string | null;
  selectedTag?: string | null;
  isLoading?: boolean;
  refreshPosts: () => void;
  onLoadMore: (page: number) => Promise<{ posts: Post[]; hasMore: boolean }>;
};

// تحسين أسلوب المقارنة للمكون PostItem
const MemoizedPostItem = memo(PostItem, (prevProps, nextProps) => {
  // مقارنة مخصصة لتجنب الرندر غير الضروري
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.updatedAt === nextProps.post.updatedAt &&
    JSON.stringify(prevProps.session?.user?.id) ===
      JSON.stringify(nextProps.session?.user?.id)
  );
});

export function PostsList({
  posts: initialPosts,
  session,
  isLoading = false,
  onLoadMore,
  refreshPosts,
}: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingAttempts = useRef(0);
  const isMounted = useRef(true);

  // تحديث الحالة عند تغيير المنشورات الأولية
  useEffect(() => {
    if (JSON.stringify(initialPosts) !== JSON.stringify(posts)) {
      setPosts(initialPosts);
      setPage(1);
      setHasMore(true);
      loadingAttempts.current = 0;

      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
    }
  }, [initialPosts]);

  // إدارة دورة حياة المكون
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
    };
  }, []);

  // دالة محسنة لتحميل المزيد من المنشورات
  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore || !isMounted.current) return;

    // منع محاولات التحميل المتكررة
    loadingAttempts.current += 1;
    if (loadingAttempts.current > 3) {
      setHasMore(false);
      return;
    }

    setLoading(true);

    try {
      const nextPage = page + 1;
      const result = await onLoadMore(nextPage);
      const newPosts = result.posts;
      const hasMorePosts = result.hasMore;

      if (isMounted.current) {
        if (!hasMorePosts || newPosts.length === 0) {
          setHasMore(false);
        } else {
          // إضافة المنشورات الجديدة مع تجنب التكرار
          setPosts((prevPosts) => {
            const uniquePostsMap = new Map();
            [...prevPosts, ...newPosts].forEach((post) =>
              uniquePostsMap.set(post.id, post)
            );
            return Array.from(uniquePostsMap.values());
          });

          setPage(nextPage);
          loadingAttempts.current = 0; // إعادة تعيين محاولات التحميل بعد النجاح
        }
      }
    } catch (error) {
      console.error("فشل في تحميل المزيد من المنشورات:", error);
      if (isMounted.current) {
        // زيادة محاولات التحميل وإعادة المحاولة لاحقًا إذا لم تكن المشكلة دائمة
        if (loadingAttempts.current >= 3) {
          setHasMore(false);
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [loading, hasMore, page, onLoadMore]);

  // رصد آخر عنصر للتحميل اللازم
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || loading || !hasMore || !isMounted.current) return;

      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }

      observer.current = new IntersectionObserver(
        async (entries) => {
          if (entries[0]?.isIntersecting && hasMore && isMounted.current) {
            await loadMorePosts();
          }
        },
        { rootMargin: "500px", threshold: 0.1 } // زيادة rootMargin لتحميل مبكر
      );

      observer.current.observe(node);
    },
    [loading, hasMore, loadMorePosts]
  );

  // تطبيق مراقب آخر عنصر بعد تحديث المنشورات
  useEffect(() => {
    if (posts.length > 0 && hasMore) {
      const timer = setTimeout(() => {
        const lastPost = document.querySelector(".post-list-item:last-child");
        if (lastPost) {
          lastPostElementRef(lastPost as HTMLDivElement);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [posts, lastPostElementRef, hasMore]);

  // عرض حالة التحميل
  if (isLoading) {
    return (
      <div className="md:w-3/5 order-1 md:order-2">
        <div className="flex justify-center w-full items-center h-40">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // عرض رسالة عندما لا توجد منشورات
  if (posts.length === 0 && !loading && !isLoading) {
    return (
      <div className="order-1 md:order-2">
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500 text-2xl">لا توجد منشورات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {posts.map((post, index) => {
        // استخدام معرف فريد يعكس محتوى المنشور
        const uniqueKey = `post-${post.id}-${post.updatedAt}`;
        const isLastItem = index === posts.length - 1;

        return (
          <div
            key={uniqueKey}
            ref={isLastItem ? lastPostElementRef : null}
            className="post-list-item"
          >
            <MemoizedPostItem
              refreshPosts={refreshPosts}
              session={session}
              post={post}
            />
          </div>
        );
      })}
      {loading && (
        <div className="flex justify-center items-center w-full my-5 mx-auto">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}

export default memo(PostsList);
