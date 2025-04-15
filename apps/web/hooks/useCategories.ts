"use client";
import { Category } from "@/lib/type";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";
import fetchData from "./fetchData";

type UseCategoriesParams = {
  initialCategories?: Category[];
  maxCategories?: number;
};

const useCategories = ({
  initialCategories = [],
  maxCategories = 10,
}: UseCategoriesParams = {}) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [categorySearchOpen, setCategorySearchOpen] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [categoryResults, setCategoryResults] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);

  // جلب التصنيفات عند التحميل وعندما يتغير الاستعلام
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/post/selectCategories${categoryQuery ? `?search=${encodeURIComponent(categoryQuery)}` : "?search="}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (response.ok) {
        // فلترة التصنيفات التي تم اختيارها بالفعل
        const data = await response.json();
        const categoryIds = categories.map((category) => category.id);
        const filteredResults = data.filter(
          (category: Category) => !categoryIds.includes(category.id)
        );
        setCategoryResults(filteredResults);
      }

      setCategoriesLoading(false);
    };

    const debounce = setTimeout(() => {
      fetchCategories();
    }, 300);

    return () => clearTimeout(debounce);
  }, [categoryQuery, categories]);

  // إضافة تصنيف محدد
  const addCategory = (category: Category) => {
    // التحقق مما إذا كانت مضافة بالفعل أو وصلت للحد الأقصى
    if (
      categories.some((c) => c.id === category.id) ||
      categories.length >= maxCategories
    ) {
      return;
    }
    setCategories((prev) => [...prev, category]);
    setCategoryQuery("");
  };

  // إزالة تصنيف
  const removeCategory = (categoryId: string) => {
    setCategories((prev) =>
      prev.filter((category) => category.id !== categoryId)
    );
  };

  return {
    categories,
    setCategories,
    categoriesLoading,
    categoryResults,
    categorySearchOpen,
    setCategorySearchOpen,
    categoryQuery,
    setCategoryQuery,
    addCategory,
    removeCategory,
    hasReachedMaxCategories: categories.length >= maxCategories,
  };
};

export default useCategories;
