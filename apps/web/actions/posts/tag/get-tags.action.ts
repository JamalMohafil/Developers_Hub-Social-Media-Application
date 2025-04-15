import fetchData from "@/hooks/fetchData";

export default async function getTagsAction(limit: number, page: number) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const url = `${BACKEND_URL}/post/tags?limit=${limit}&page=${page}`;
  return fetchData(url, {
    method: "GET",
  });
}
