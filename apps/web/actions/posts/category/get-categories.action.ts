"use client";
import fetchData from "@/hooks/fetchData";

export default async function getCategoriesAction(limit: number, page: number) {
   const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/post/categories?limit=${limit}&page=${page}`;
  return fetchData(url, { method: "GET" });
}
