"use server";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { SessionType, UserInfoType } from "./type";
import { authFetch } from "../hooks/authFetch";
import { redirect } from "next/navigation";
import deleteSession from "@/actions/actions";

// eslint-disable-next-line turbo/no-undeclared-env-vars
const secretKey = process.env.SESSION_SECRET_KEY;
const EncodedKey = new TextEncoder().encode(secretKey);
// eslint-disable-next-line turbo/no-undeclared-env-vars
const BACKEND_URL = process.env.BACKEND_URL;

// استدعاء بيانات المستخدم من API
export async function fetchUserInfo(accessToken: string): Promise<any> {
  try {
    const url = `${BACKEND_URL}/auth/me`;
    console.log("Fetching from URL:", url); // للتشخيص

    const userInfoResponse = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      // إضافة هذه الخيارات قد تساعد
      next: { revalidate: 0 },
    });

    if (!userInfoResponse.ok) {
      console.log(
        `Failed to fetch user info: ${userInfoResponse.status} - ${userInfoResponse.statusText}`
      );
      return null;
    }

    const data = await userInfoResponse.json();
    return data;
  } catch (error) {
    console.log("Error fetching user info:", error);
    return null;
  }
}

export async function createSession(payload: SessionType) {
  "use server";
  // إضافة وقت آخر تحديث للبيانات
  const sessionData = {
    ...payload,
    lastUpdated: Date.now(),
  };

  const session = await new SignJWT(sessionData)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(EncodedKey);

  // تخزين الجلسة الجديدة في الكوكيز
  const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (await cookies()).set("session", session, {
    // httpOnly: true,
    // secure: true,
    expires: expiredAt,
    // sameSite: "lax",
    // path: "/",
  });
}

export async function getSession() {
  "use server";
  try {
    // قراءة كوكي الجلسة
    const cookie = (await cookies()).get("session")?.value;
    if (!cookie) {
      return null;
    }

    // التحقق من صحة الـ JWT واستخراج البيانات
    const { payload } = await jwtVerify(cookie, EncodedKey, {
      algorithms: ["HS256"],
    });
    const sessionData = payload as SessionType & {
      exp?: number;
      lastUpdated?: number;
    };

    // إنشاء الجلسة الأساسية
    const basicSession = {
      user: sessionData.user,
      accessToken: sessionData.accessToken,
      lastUpdated: sessionData.lastUpdated || Date.now(),
    };

    // التحقق مما إذا كان يجب تحديث معلومات المستخدم بناءً على الوقت المنقضي
    const currentTime = Date.now();
    const lastUpdateTime = sessionData.lastUpdated || 0;
    const updateInterval = 30 * 60 * 1000; // تحديث كل 30 دقيقة (بالمللي ثانية)

    if (currentTime - lastUpdateTime > updateInterval) {
      // تحديث معلومات المستخدم فقط إذا مر وقت كافٍ منذ آخر تحديث
      return await refreshUserSession(basicSession);
    }

    return basicSession;
  } catch (e) {
    console.error("❌ فشل التحقق من الجلسة:", e);
    // حذف الكوكي في حالة الفشل للتأكد من تسجيل الخروج
    await deleteSession();
    return null;
  }
}

export async function refreshUserSession(session?: SessionType) {
  // إذا لم يتم تمرير جلسة، نحاول الحصول عليها أولاً
  if (!session) {
    const currentCookie = (await cookies()).get("session")?.value;
    if (!currentCookie) {
      return null;
    }

    try {
      const { payload } = await jwtVerify(currentCookie, EncodedKey, {
        algorithms: ["HS256"],
      });
      session = payload as SessionType;
    } catch (e) {
      await deleteSession();
      return null;
    }
  }

  // التحقق من صحة توكن الوصول
  const updatedUserInfo = await fetchUserInfo(session.accessToken);

  if (!updatedUserInfo) {
    // إذا فشل الحصول على معلومات المستخدم، نقوم بحذف الجلسة
    await deleteSession();
    return null;
  }

  // تحديث البيانات في الجلسة
  const updatedSession: SessionType = {
    user: updatedUserInfo,
    accessToken: session.accessToken,
  };

  // تحديث الجلسة في الكوكيز
  await createSession(updatedSession);

  return updatedSession;
}
