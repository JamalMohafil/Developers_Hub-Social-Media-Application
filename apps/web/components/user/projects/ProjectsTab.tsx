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
import type { ProfileType, Project } from "@/lib/type";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ProjectCard } from "./ProjectCard";
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
import {
  getProjects,
  getUserProjects,
} from "@/actions/user/project/get-projects.action";

type Props = {
  isOwnProfile: boolean;
  userData: ProfileType;
  activeTab: string;
};

// إضافة نوع البيانات لنتيجة الـ API
export interface ProjectsResponse {
  projects: Project[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

const ProjectsTab = ({ isOwnProfile, userData, activeTab }: Props) => {
  // تعديل حالة المشاريع لتشمل معلومات الصفحات
  const [projectsData, setProjectsData] = useState<ProjectsResponse>({
    projects: [],
    pagination: {
      total: 0,
      pages: 0,
      page: 1, // ابدأ من الصفحة 1 بدلاً من 0
      limit: 3,
      hasNext: false,
      hasPrevious: false,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const fetchProjects = async () => {
    if (activeTab === "projects") {
      try {
        setIsLoading(true);
        // جلب المشاريع ومعلومات الصفحات
        const response = await getUserProjects(
          userData.id,
          projectsData.pagination.limit,
          projectsData.pagination.page
        );
        if (response) {
          setProjectsData(response);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

 
  useEffect(() => {
    // Reset loading state when tab changes to something other than projects
    if (activeTab !== "projects") {
      setIsLoading(false);
      return;
    }

    // Only fetch if we're on the projects tab
    fetchProjects();
  }, [
    activeTab,
    userData.id,
    projectsData.pagination.page,
    projectsData.pagination.limit,
  
  ]);

  // دالة لتغيير الصفحة
  const handlePageChange = (newPage: number) => {
    setProjectsData((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        page: newPage,
      },
    }));
  };
  const router = useRouter();
  // معالجة تحديث المشروع
  const handleProjectUpdated = () => {
    // في تطبيق حقيقي، ستقوم بإعادة جلب قائمة المشاريع المحدثة
    router.refresh();
    fetchProjects();
  };

  // إنشاء عناصر روابط الصفحات
  const renderPaginationLinks = () => {
    const { page, pages } = projectsData.pagination;
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

  return (
    <Card className="overflow-hidden border border-slate-800 bg-slate-900 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
        <div>
          <CardTitle className="text-2xl font-bold text-white">
            Projects
          </CardTitle>
          <CardDescription className="text-slate-400">
            {isOwnProfile
              ? "Showcase your work and achievements"
              : `${userData.user?.name}'s portfolio`}
          </CardDescription>
        </div>
        {isOwnProfile && (
          <Button className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4" />
            <Link href={`/projects/add-project`}>Add Project</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <ProjectSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {projectsData.projects && projectsData.projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projectsData.projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isOwnProfile={isOwnProfile}
                    onProjectUpdated={handleProjectUpdated}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg bg-slate-800 py-16 text-center">
                <div className="mb-4 rounded-full bg-slate-700 p-4">
                  <Plus className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-white">
                  No projects yet
                </h3>
                <p className="max-w-md text-slate-400">
                  {isOwnProfile
                    ? "Showcase your skills by adding projects to your portfolio."
                    : "This user hasn't added any projects to their portfolio yet."}
                </p>
                {isOwnProfile && (
                  <Button className="mt-4 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="h-4 w-4" />
                    <Link href={`/projects/add-project`}>
                      Add Your First Project
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* إظهار مكون الصفحات فقط إذا كان هناك أكثر من صفحة واحدة */}
      {!isLoading && projectsData.pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-slate-800">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (projectsData.pagination.hasPrevious) {
                      handlePageChange(projectsData.pagination.page - 1);
                    }
                  }}
                  className={
                    !projectsData.pagination.hasPrevious
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
                    if (projectsData.pagination.hasNext) {
                      handlePageChange(projectsData.pagination.page + 1);
                    }
                  }}
                  className={`${
                    !projectsData.pagination.hasNext
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

const ProjectSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
      <Skeleton className="h-48 w-full bg-slate-700" />
      <div className="p-5">
        <Skeleton className="mb-2 h-7 w-3/4 bg-slate-700" />
        <Skeleton className="mb-4 h-4 w-full bg-slate-700" />
        <Skeleton className="mb-4 h-4 w-5/6 bg-slate-700" />
        <div className="mb-4 flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full bg-slate-700" />
          <Skeleton className="h-6 w-20 rounded-full bg-slate-700" />
          <Skeleton className="h-6 w-14 rounded-full bg-slate-700" />
        </div>
      </div>
    </div>
  );
};

export default ProjectsTab;
