import "server-only";
import { cookies } from "next/headers";
import { BACKEND_URL, EncodedKey } from "./constants";
import { jwtVerify } from "jose";
import { SessionType } from "./type";
import { createSession, getSession } from "./session";
 

// export const refreshToken = async (oldRefreshToken: string) => {
//   try {
//     const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${oldRefreshToken}`,
//       },
//     });
//     if (!response.ok) {
//       throw new Error("Failed to refresh token");
//     }

//     const data = await response.json();
//     console.log((await cookies()).get("session")?.value, "adsfghnjm");
//     const updateRes = await fetch(
//       "http://localhost:3000/api/auth/updateToken",
//       {
//         method: "POST",
//         body: JSON.stringify({
//           refreshToken: data.refreshToken,
//           accessToken: data.accessToken,
//           session: (await cookies()).get("session")?.value,
//         }),
//       }
//     );
//     console.log(updateRes,'adsfbn')
//     if (!updateRes.ok) {
//       throw new Error("Failed to update tokens");
//     }
//     return data.accessToken;
//   } catch (e) {
//     console.log("refresh token failed", e);
//     return null;
//   }
// };
export async function verifyToken(token: string): Promise<SessionType | null> {
  try {
    // تحقق من الجلسة الحالية أولاً

    // تحقق من صحة التوكن المقدم أولاً
    let payload;
    try {
      payload = await jwtVerify(token, EncodedKey, {
        algorithms: ["HS256"],
      });
    } catch (error) {
      // في حال كان التوكن منتهي الصلاحية أو غير صالح، جرب تحديث التوكن
      console.log(error);
    }

    // في حال كان التوكن صالحًا أو تم تحديثه، قم بإرجاعه
    return payload ? (payload.payload as SessionType) : null;
  } catch (error) {
    console.log("Token verification failed:", error);
    return null;
  }
}

// export const updateTokens = async ({
//   accessToken,
//   refreshToken,
//   payload,
// }: {
//   accessToken: string;
//   refreshToken: string;
//   payload: SessionType;
// }) => {
//   if (!payload) return null;
//   console.log(accessToken, "old apserdg");
//   // إنشاء كائن البيانات الجديد مع التوكن المحدث
//   const newPayload = {
//     user: {
//       ...payload?.user,
//     },
//     accessToken: accessToken,
//     refreshToken: payload.refreshToken,
//   };

//   console.log(newPayload, "New session payload");

//   // إنشاء جلسة جديدة بالتوكن المحدث
//   return await createSession(newPayload);
// };
