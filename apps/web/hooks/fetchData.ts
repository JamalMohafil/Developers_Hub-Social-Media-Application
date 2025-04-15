"use client";
export default async function fetchData<T>(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });



  const data = await response.json();
   return data;
}
