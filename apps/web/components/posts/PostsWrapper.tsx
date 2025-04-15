"use client"; // components/posts/PostsWrapper.tsx

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useTransition,
  Suspense,
} from "react";
import { PostsList } from "./PostsList";
import { SidebarFilter } from "./SidebarFilter";
import { Post, SessionType } from "@/lib/type";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { fetchPosts } from "@/actions/posts/get-all-posts.action";
import { POST_LIMIT } from "@/app/posts/page";
import CreatePost from "./CreatePost";

type Props = {
  session: SessionType | null;
};

const PostsWrapper = ({ session }: Props) => {
  // استخدام state للبيانات
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isPending, startTransition] = useTransition(); // استخدام useTransition لتحسين أداء UI
  const isFirstLoad = useRef(true);

  const currentLoadingId = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // قراءة المعايير من URL
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const categoryId = searchParams.get("categoryId") || undefined;
  const tagId = searchParams.get("tagId") || undefined;

  // دالة محسنة لتحديث URL بدون إعادة تحميل الصفحة
  const updateFilters = useCallback(
    (params: Record<string, string>) => {
      startTransition(() => {
        // إنشاء نسخة جديدة من معايير البحث
        const newParams = new URLSearchParams(searchParams.toString());

        // تحديث أو إضافة المعايير الجديدة
        Object.entries(params).forEach(([key, value]) => {
          if (value) {
            newParams.set(key, value);
          } else {
            newParams.delete(key);
          }
        });

        // استخدام router.push بدلاً من window.location.href لتفادي تحميل الصفحة بالكامل
        const newUrl = `${pathname}?${newParams.toString()}`;
        router.push(newUrl);
      });
    },
    [router, pathname, searchParams]
  );

  // استدعاء البيانات الأولي في التحميل الأول
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        const initialData = await fetchPosts(
          POST_LIMIT,
          1,
          sortOrder,
          categoryId,
          tagId
        );
        setPosts(initialData);
      } catch (error) {
        console.error("فشل في تحميل البيانات الأولية:", error);
      } finally {
        setInitialLoading(false);
        isFirstLoad.current = false;
      }
    };

    loadInitialData();

    // تنظيف الموارد عند تفكيك المكون
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // استدعاء مرة واحدة فقط عند تحميل المكون

  // دالة محسنة لتحميل البيانات المفلترة
  const loadFilteredPosts = useCallback(async () => {
    try {
      // إلغاء أي طلب سابق قبل بدء طلب جديد
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // إنشاء متحكم إلغاء جديد للطلب الحالي
      abortControllerRef.current = new AbortController();

      setIsLoadingPosts(true);

      // إنشاء معرف جديد لعملية التحميل هذه
      const thisLoadingId = ++currentLoadingId.current;

      // استخدام معامل signal لدعم إلغاء الطلب
      const newPosts = await fetchPosts(
        POST_LIMIT, // limit
        1, // page
        sortOrder,
        categoryId,
        tagId,
        { signal: abortControllerRef.current.signal } // إضافة signal لدعم الإلغاء
      );

      // تأكد من أن عملية التحميل هذه هي الأحدث قبل تحديث الحالة
      if (thisLoadingId === currentLoadingId.current) {
        setPosts(newPosts);
      }
    } catch (error) {
      // تجاهل أخطاء الإلغاء
      if ((error as Error).name !== "AbortError") {
        console.error("فشل في تحميل المنشورات:", error);
      }
    } finally {
      setIsLoadingPosts(false);
    }
  }, [categoryId, sortOrder, tagId]);

  // إعادة تحميل البيانات عند تغيير معايير التصفية
  // تحسين تبعيات useEffect وتفادي التحميل المتكرر
  useEffect(() => {
    if (!isFirstLoad.current) {
      loadFilteredPosts();
    }

    // تنظيف الموارد عند تفكيك المكون
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [categoryId, sortOrder, tagId, loadFilteredPosts]);

  const refreshPosts = () => {
    loadFilteredPosts();
  };

  // تحميل المزيد من المنشورات بشكل متوازٍ
  const handleLoadMore = useCallback(
    async (page: number) => {
      try {
        const controller = new AbortController();

        const morePosts = await fetchPosts(
          POST_LIMIT,
          page,
          sortOrder,
          categoryId,
          tagId,
          { signal: controller.signal }
        );

        return {
          posts: morePosts,
          hasMore: morePosts.length > 0,
        };
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("فشل في تحميل المزيد من المنشورات:", error);
        }
        return {
          posts: [],
          hasMore: false,
        };
      }
    },
    [sortOrder, categoryId, tagId]
  );

  // استخدام useMemo لتوفير قيمة مفتاح مستقرة
  const postsListKey = `${sortOrder}-${categoryId || "all"}-${tagId || "all"}`;

  // عرض مؤشر التحميل عندما تكون البيانات قيد التحميل
  const isLoading = initialLoading || isLoadingPosts || isPending;

  return (
    <>
      <div className="md:w-1/4 flex w-full items-start justify-between">
        <SidebarFilter
          sortOrder={sortOrder}
          categoryId={categoryId}
          tagId={tagId}
          onFilterChange={updateFilters}
        />
      </div>
      <Suspense fallback={null}>
        <div className="md:w-3/5 order-1 md:order-2">
          {session?.user && (
            <CreatePost user={session.user} refreshPosts={refreshPosts} />
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <PostsList
              key={postsListKey}
              posts={posts}
              refreshPosts={refreshPosts}
              session={session}
              sortOrder={sortOrder}
              selectedCategory={categoryId}
              selectedTag={tagId}
              isLoading={isLoading}
              onLoadMore={handleLoadMore}
            />
          )}
        </div>
      </Suspense>
    </>
  );
};

export default PostsWrapper;
