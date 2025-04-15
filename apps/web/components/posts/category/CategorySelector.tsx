"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Search, FolderIcon, Loader2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useCategories from "@/hooks/useCategories";
import type { Category } from "@/lib/type";

interface CategorySelectorProps {
  initialCategories?: Category[];
  maxCategories?: number;
  onChange?: (categories: Category[]) => void;
}

export default function CategorySelector({
  initialCategories = [],
  maxCategories = 10,
  onChange,
}: CategorySelectorProps) {
  // استخدام الهوك المخصص
  const {
    categories,
    categoriesLoading,
    categoryResults,
    categorySearchOpen,
    setCategorySearchOpen,
    categoryQuery,
    setCategoryQuery,
    addCategory,
    removeCategory,
    hasReachedMaxCategories,
  } = useCategories({
    initialCategories,
    maxCategories,
  });

  // تشغيل دالة التغيير عند تحديث التصنيفات
  useEffect(() => {
    if (onChange) {
      onChange(categories);
    }
  }, [onChange, categories]);

  return (
    <div className="grid gap-2">
      <label
        htmlFor="categories"
        className="text-sm font-medium flex items-center gap-1"
      >
        <FolderIcon className="h-4 w-4" />
        التصنيفات{" "}
        {categories.length > 0 && (
          <span className="text-xs text-muted-foreground">
            ({categories.length}/{maxCategories})
          </span>
        )}
      </label>

      {/* عرض التصنيفات المحددة */}
      <div className="flex flex-wrap gap-2 mb-2">
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant="secondary"
            className="flex items-center gap-1 bg-primary/10 text-primary"
          >
            {category.name}
            <button
              type="button"
              onClick={() => removeCategory(category.id)}
              className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-primary/20"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* البحث عن التصنيفات */}
      <Popover open={categorySearchOpen} onOpenChange={setCategorySearchOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={categorySearchOpen}
            className="w-full justify-between"
            disabled={hasReachedMaxCategories}
          >
            {hasReachedMaxCategories
              ? `الحد الأقصى للتصنيفات (${maxCategories})`
              : "البحث عن تصنيفات..."}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="ابحث عن تصنيفات..."
              value={categoryQuery}
              onValueChange={setCategoryQuery}
            />
            <CommandList>
              <CommandEmpty>
                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري البحث...
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm">
                    لم يتم العثور على تصنيفات.
                    {categoryQuery.trim() && (
                      <Button
                        variant="link"
                        className="px-2 py-0 h-auto"
                        onClick={() => {
                          addCategory({
                            id: "new",
                            name: categoryQuery.trim(),
                          });
                          setCategorySearchOpen(false);
                        }}
                      >
                        إنشاء "{categoryQuery.trim()}"
                      </Button>
                    )}
                  </div>
                )}
              </CommandEmpty>
              {categoryResults.length > 0 && (
                <CommandGroup heading="التصنيفات المتاحة">
                  {categoryResults.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={() => {
                        addCategory(category);
                        setCategorySearchOpen(false);
                      }}
                    >
                      <FolderIcon className="ml-2 h-4 w-4" />
                      {category.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
