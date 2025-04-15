"use client";
import { Tag } from "@/lib/type";
import { useState, useEffect, useCallback, useRef } from "react";
import { BACKEND_URL } from "@/lib/constants";

type UseTagsParams = {
  initialTags?: Tag[];
  maxTags?: number;
};

const useTags = ({ initialTags = [], maxTags = 10 }: UseTagsParams = {}) => {
  const [tags, setTags] = useState(initialTags);
  const [tagSearchOpen, setTagSearchOpen] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const [tagResults, setTagResults] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState<boolean>(false);

  // استخدام useRef لتخزين قيمة tags الحالية دون التسبب في ريرندر
  const tagsRef = useRef(tags);

  // تحديث tagsRef عند تغيير tags
  useEffect(() => {
    tagsRef.current = tags;
  }, [tags]);

  // تحسين دالة fetchTags باستخدام useCallback
  const fetchTags = useCallback(async (query: string) => {
    if (query.length < 1) {
      setTagResults([]);
      return;
    }

    try {
      setTagsLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/post/selectTags?search=${query ? encodeURIComponent(query) : ""}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );

      if (response.ok) {
        const data = await response.json();
        // استخدام tagsRef.current بدلاً من tags للوصول إلى القيمة الحالية
        const tagIds = tagsRef.current.map((tag) => tag.id);
        const filteredResults = data.filter(
          (tag: Tag) => !tagIds.includes(tag.id)
        );
        setTagResults(filteredResults);
      }
    } catch (error) {
      console.error("Error searching tags:", error);
    } finally {
      setTagsLoading(false);
    }
  }, []);

  // تبسيط useEffect وتقليل التبعيات
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchTags(tagQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [tagQuery, fetchTags]);

  // تحسين دالة addTag باستخدام useCallback
  const addTag = useCallback(
    (tag: Tag) => {
      setTags((prev) => {
        // تفحص إذا كانت العلامة موجودة بالفعل أو وصلنا للحد الأقصى
        if (prev.some((s) => s.id === tag.id) || prev.length >= maxTags) {
          return prev;
        }
        return [...prev, tag];
      });
      setTagQuery("");
    },
    [maxTags]
  );

  // تحسين دالة removeTag باستخدام useCallback
  const removeTag = useCallback((tagId: string) => {
    setTags((prev) => prev.filter((tag) => tag.id !== tagId));
  }, []);

  // حساب hasReachedMaxTags من خلال tags مباشرة
  const hasReachedMaxTags = tags.length >= maxTags;

  // إزالة console.log لتجنب الريرندر الإضافي

  return {
    tags,
    setTags,
    tagsLoading,
    tagResults,
    tagSearchOpen,
    setTagSearchOpen,
    tagQuery,
    setTagQuery,
    addTag,
    removeTag,
    hasReachedMaxTags,
  };
};

export default useTags;
