// 1. أولاً، أنشئ ملف api/update-session.ts
import { NextRequest, NextResponse } from "next/server";
import { createSession, fetchUserInfo } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { session } = body;
    if (!session) {
      return NextResponse.json({ success: false, message: "No session found" });
    }
    const updatedUserInfo = await fetchUserInfo(session.accessToken);
 
    if (updatedUserInfo) {
      await createSession({
        user: updatedUserInfo,
        accessToken: session.accessToken,
        // refreshToken: session.refreshToken,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({
      success: false,
      message: "Failed to update user info",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
