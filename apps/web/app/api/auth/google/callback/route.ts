import { sanitizeValue } from "@/lib/utils";
import { createSession } from "../../../../../lib/session";
import { Role } from "../../../../../lib/type";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accessToken = searchParams.get("accessToken");
  // const refreshToken = searchParams.get("refreshToken");
  const userId = searchParams.get("userId");
  const name = sanitizeValue(searchParams.get("displayName"));
  const username = sanitizeValue(searchParams.get("username"));
  const role = searchParams.get("role") as Role;
  const email = searchParams.get("email");
  const oauthId = searchParams.get("oauthId") as string;
  const image = sanitizeValue(searchParams.get("image"));

  if (!accessToken  || !userId || !role) {
    throw new Error("Google Auth Failed!");
  }

   await createSession({
    user: {
      email: email as string,
      id: userId,
      emailVerified: true,
      username: username || null,
      name,
      image,
      role,
      oauthId,
    },
    // refreshToken,
    accessToken,
  });

  redirect("/");
}

// دالة تساعد على التحقق مما إذا كانت القيمة "null" كنص أو undefined أو فارغة
