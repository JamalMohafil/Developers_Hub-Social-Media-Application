"use client";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getProjects } from "@/actions/user/project/get-projects.action";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "@/lib/type";
import { ProjectCard } from "./ProjectCard";
import { ProjectsSidebarFilters } from "./ProjectsSidebarFilter";

type PaginationData = {
  total: number;
  pages: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

const ProjectsWrapper = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(8);
  const [page, setPage] = useState(
    Number.parseInt(searchParams.get("page") || "1", 10)
  );

  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "desc");
  const skillId = searchParams.get("skillId");
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 8,
    hasNext: false,
    hasPrevious: false,
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProjects(limit, page, sortBy, skillId);
      setProjects(result.projects);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  }, [limit, page, sortBy, skillId]);

  useEffect(() => {
    fetchProjects();
  }, [page, limit, sortBy, skillId, fetchProjects]);

  const handleFilterChange = (filters: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update search params
    Object.entries(filters).forEach(([key, value]) => {
       if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      if(key === "sortBy" && value) setSortBy(value);
    });

    // Reset to page 1 when filters change
    params.set("page", "1");
    setPage(1);

    // Update URL without reloading the page
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    setPage(newPage);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleProjectUpdated = () => {
    fetchProjects();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
      <div className="md:col-span-1">
        <ProjectsSidebarFilters
          sortOrder={sortBy}
          skillId={skillId}
          onFilterChange={handleFilterChange}
        />
      </div>
      <div className="md:col-span-3">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: limit }).map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isOwnProfile={false}
                  onProjectUpdated={handleProjectUpdated}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!pagination.hasPrevious}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>

                <div className="flex items-center gap-1">
                  {generatePaginationArray(
                    pagination.page,
                    pagination.pages
                  ).map((pageNum, i) =>
                    pageNum === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-2">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={pageNum}
                        variant={
                          pageNum === pagination.page ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum as number)}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!pagination.hasNext}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px] rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-medium text-muted-foreground">
              No projects found
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Try changing your filters or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to generate pagination array with ellipsis for large page counts
function generatePaginationArray(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

export const ProjectCardSkeleton = () => (
  <div className="rounded-xl border border-slate-700 bg-slate-800 overflow-hidden shadow-sm">
    <div className="h-48 w-full bg-slate-700 animate-pulse" />
    <div className="p-5 space-y-4">
      <div className="h-6 bg-slate-700 rounded animate-pulse w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-700 rounded animate-pulse" />
        <div className="h-4 bg-slate-700 rounded animate-pulse w-5/6" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-6 w-16 bg-slate-700 rounded-full animate-pulse"
          />
        ))}
      </div>
    </div>
  </div>
);

export default ProjectsWrapper;
