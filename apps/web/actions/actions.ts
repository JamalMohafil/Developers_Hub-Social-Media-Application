"use server";

import { cookies } from "next/headers";

export default async function deleteSession() {
 return (await cookies()).delete("session");
}
