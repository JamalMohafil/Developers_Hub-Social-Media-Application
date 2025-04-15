"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { SortToggle } from "./SortToggle";
import { Separator } from "../ui/separator";
import { Filter, TagIcon } from "lucide-react";
import { Category, Tag } from "@/lib/type";
import getTagsAction from "@/actions/posts/tag/get-tags.action";
import getCategoriesAction from "@/actions/posts/category/get-categories.action";
 

type SidebarFilterProps = {
  sortOrder?: string;
  categoryId?: string;
  tagId?: string;
  onFilterChange: (filters: Record<string, string>) => void;
};

 
export function SidebarFilter({
  sortOrder = "desc",
  categoryId,
  tagId,
  onFilterChange,
}: SidebarFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryId || "all"
  );
  const [selectedTag, setSelectedTag] = useState<string>(tagId || "all");
  const [sortOrderState, setSortOrderState] = useState<string>(sortOrder);
  const [hasMoreCategories, setHasMoreCategories] = useState(true);
  const [hasMoreTags, setHasMoreTags] = useState(true);
  const [categoryPage, setCategoryPage] = useState(1);
  const [tagPage, setTagPage] = useState(1);
  const limit = 10;
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);

  // تحميل التصنيفات
  const loadCategories = async (page: number) => {
    setLoadingCategories(true);
    try {
      const categories = await getCategoriesAction(limit, page);
      if (page === 1) {
        setCategories(categories || []);
      } else {
        setCategories((prev) => [...prev, ...(categories || [])]);
      }
      setHasMoreCategories((categories || []).length === limit);
    } catch (error) {
      console.error("فشل في جلب التصنيفات:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // تحميل الوسوم
  const loadTags = async (page: number) => {
    setLoadingTags(true);
    try {
      const tags = await getTagsAction(limit, page);
      if (page === 1) {
        setTags(tags || []);
      } else {
        setTags((prev) => [...prev, ...(tags || [])]);
      }
      setHasMoreTags((tags || []).length === limit);
    } catch (error) {
      console.error("فشل في جلب الوسوم:", error);
    } finally {
      setLoadingTags(false);
    }
  };

  // تحميل البيانات عند التهيئة
  useEffect(() => {
    loadCategories(1);
    loadTags(1);
  }, []);

  // تحديث الحقول المحلية عند تغيير props
  useEffect(() => {
    if (categoryId) setSelectedCategory(categoryId);
    if (tagId) setSelectedTag(tagId);
    if (sortOrder) setSortOrderState(sortOrder);
  }, [categoryId, tagId, sortOrder]);

  // معالجة تغيير ترتيب الفرز
  const handleSortChange = () => {
    const newSortOrder = sortOrderState === "desc" ? "asc" : "desc";
    setSortOrderState(newSortOrder);
    onFilterChange({ sortOrder: newSortOrder });
  };

  // معالجة اختيار تصنيف
  const handleCategorySelect = (catId: string) => {
    const newCategoryId = catId === "all" ? "" : catId;
    setSelectedCategory(catId);
    onFilterChange({ categoryId: newCategoryId });
  };

  // معالجة اختيار وسم
  const handleTagSelect = (tId: string) => {
    const newTagId = tId === "all" ? "" : tId;
    setSelectedTag(tId);
    onFilterChange({ tagId: newTagId });
  };

  // تحميل المزيد من التصنيفات
  const handleLoadMoreCategories = () => {
    if (loadingCategories) return;
    const nextPage = categoryPage + 1;
    setCategoryPage(nextPage);
    loadCategories(nextPage);
  };

  // تحميل المزيد من الوسوم
  const handleLoadMoreTags = () => {
    if (loadingTags) return;
    const nextPage = tagPage + 1;
    setTagPage(nextPage);
    loadTags(nextPage);
  };

  const CategorySkeleton = () => (
    <div className="space-y-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-9 bg-muted animate-pulse rounded-md" />
      ))}
    </div>
  );

  const TagSkeleton = () => (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-6 w-16 bg-muted animate-pulse rounded-full" />
      ))}
    </div>
  );

  return (
    <Card className="border-border w-full bg-card text-card-foreground sticky top-20">
      <CardContent className="p-0">
        {/* العنوان */}
        <div className="p-4 flex items-center gap-2 border-b border-border">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>

        {/* قسم ترتيب الفرز */}
        <div className="p-4">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">
            Sort By
          </h3>
          <SortToggle sortOrder={sortOrderState} onToggle={handleSortChange} />
        </div>

        <Separator className="bg-border/50" />

        {/* قسم التصنيفات */}
        <div className="p-4">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-1">
            <TagIcon className="h-3.5 w-3.5" /> Categories
          </h3>
          {loadingCategories ? (
            <CategorySkeleton />
          ) : (
            <>
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={() => handleCategorySelect("all")}
                    className={`text-left cursor-pointer w-full py-1.5 px-3 rounded-md transition-colors ${
                      selectedCategory === "all"
                        ? "font-medium text-primary bg-accent/20"
                        : "text-card-foreground hover:bg-muted"
                    }`}
                    disabled={loadingCategories}
                  >
                    All Categories
                  </button>
                </li>
                {categories && categories.length > 0 && categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => handleCategorySelect(category.id)}
                      className={`text-left cursor-pointer w-full py-1.5 px-3 rounded-md transition-colors ${
                        selectedCategory === category.id
                          ? "font-medium text-primary bg-accent/20"
                          : "text-card-foreground hover:bg-muted"
                      }`}
                      disabled={loadingCategories}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
              {hasMoreCategories && (
                <Button
                  onClick={handleLoadMoreCategories}
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-primary hover:text-primary hover:bg-accent/20 w-full justify-center"
                  disabled={loadingCategories}
                >
                  Show more
                </Button>
              )}
              {categories.length === 0 && !loadingCategories && (
                <p className="text-muted-foreground text-sm mt-2">
                  No categories
                </p>
              )}
            </>
          )}
        </div>

        <Separator className="bg-border/50" />

        {/* قسم الوسوم */}
        <div className="p-4">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">
            Tags
          </h3>
          {loadingTags ? (
            <TagSkeleton />
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge
                  onClick={() => handleTagSelect("all")}
                  className={`cursor-pointer ${
                    selectedTag === "all"
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  All Tags
                </Badge>
                {tags && tags.length > 0 && tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    onClick={() => handleTagSelect(tag.id)}
                    className={`cursor-pointer ${
                      selectedTag === tag.id
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    }`}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              {hasMoreTags && (
                <Button
                  onClick={handleLoadMoreTags}
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-primary hover:text-primary hover:bg-accent/20 w-full justify-center"
                  disabled={loadingTags}
                >
                  Show more
                </Button>
              )}
              {tags.length === 0 && !loadingTags && (
                <p className="text-muted-foreground text-sm mt-2">No tags</p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
