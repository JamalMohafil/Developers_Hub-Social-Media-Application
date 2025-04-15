// "use server";
// import { SignJWT, jwtVerify } from "jose";
// import { EncodedKey } from "@/lib/constants";
// import { cookies } from "next/headers";
// import { NextRequest, NextResponse } from "next/server";
// import { SessionType } from "@/lib/type";

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const { accessToken, refreshToken, session: oldSession } = body;

//   if (!accessToken || !refreshToken || !oldSession) {
//     return NextResponse.json(
//       { message: "Provide all required tokens" },
//       { status: 401 }
//     );
//   }

//   try {
//     // فك تشفير الجلسة القديمة للحصول على معلومات المستخدم
//     const { payload } = (await jwtVerify(oldSession, EncodedKey, {
//       algorithms: ["HS256"],
//     })) as { payload: SessionType & { exp?: number } };

//     // إنشاء الـ payload الجديد
//     const newPayload = {
//       user: {
//         ...payload.user,
//       },
//       accessToken: accessToken,
//       refreshToken: refreshToken,
//       lastUpdated: Date.now(),
//     };

//     // إنشاء الجلسة الجديدة
//     const expireTime = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 أيام
//     const newSession = await new SignJWT(newPayload)
//       .setProtectedHeader({ alg: "HS256" })
//       .setIssuedAt()
//       .setExpirationTime(expireTime)
//       .sign(EncodedKey);

//     // إنشاء استجابة مع الكوكي
//     const response = NextResponse.json({
//       message: "Tokens updated successfully",
//     });

//     response.cookies.set({
//       name: "session",
//       value: newSession,
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       path: "/",
//       maxAge: 7 * 24 * 60 * 60, // 7 أيام
//     });
//     console.log(response, "responsasdfgbe");
//     return response;
//   } catch (error) {
//     console.error("Token update error:", error);
//     return NextResponse.json(
//       { message: "Token update failed" },
//       { status: 401 }
//     );
//   }
// }
