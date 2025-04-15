import { NextRequest, NextResponse } from "next/server";
import { createSession, fetchUserInfo, getSession } from "./lib/session";
import { authRoutes, publicRoutes, userRoutes } from "./routes";
import { jwtVerify } from "jose";
import { SessionType } from "./lib/type";
import { EncodedKey } from "./lib/constants"; // تأكد من استيراد المفتاح بشكل صحيح

async function getSessionForMiddleware(req: NextRequest) {
  // الحصول على كوكي الجلسة مباشرة من الطلب
  const cookie = req.cookies.get("session")?.value;

  if (!cookie) {
    return null;
  }

  try {
    // التحقق من صحة الكوكي فقط دون الاتصال بالخادم
    const { payload } = await jwtVerify(cookie, EncodedKey, {
      algorithms: ["HS256"],
    });
    const sessionDaata: any = payload;

    const shouldRefresh = true;
    if (shouldRefresh) {
      try {
        const updatedUserInfo = await fetchUserInfo(sessionDaata.accessToken);

        if (updatedUserInfo) {
          await createSession({
            user: updatedUserInfo,
            accessToken: sessionDaata.accessToken,
            // refreshToken: session.refreshToken,
          });
        }
      } catch (error) {
        console.error("فشل تحديث معلومات المستخدم:", error);
        // لا تقم بإعادة التوجيه أو رمي خطأ
      }
    }
    // إرجاع بيانات الجلسة الأساسية فقط
    const sessionData = payload as SessionType;
    return {
      user: sessionData.user,
      accessToken: sessionData.accessToken,
      // refreshToken: sessionData.refreshToken,
    };
  } catch (e) {
    return null;
  }
}

export default async function middleware(req: NextRequest) {
  try {
    // استخدام الدالة المبسطة بدلاً من getSession
    const session = await getSessionForMiddleware(req);
    const { nextUrl } = req;
    const path = nextUrl.pathname;

    // المطابقات الأساسية للمسارات
    const isAuthRoute = authRoutes.some((route) => matchPath(path, route));
    const isUserRoute = userRoutes.some((route) => matchPath(path, route));

    // تعامل مع API بشكل منفصل
    if (path.startsWith("/api/")) {
      if (path.startsWith("/api/user/") && (!session || !session.user)) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
      }
      return NextResponse.next();
    }

    // حماية مسارات المستخدم
    if (isUserRoute && (!session || !session.user)) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    // التحقق من التحقق من البريد الإلكتروني
    if (path.startsWith("/auth/email-verify") && session?.user?.emailVerified) {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }

    // منع الوصول إلى مسارات المصادقة إذا كان المستخدم مسجل الدخول
    if (isAuthRoute && session && session.user) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("خطأ في الميدلوير:", error);
    // في حالة وجود خطأ، نسمح بالمرور لتجنب تعطل الموقع
    return NextResponse.next();
  }
}

// دالة مساعدة للمطابقة الدقيقة للمسارات
function matchPath(pathname: string, pattern: string): boolean {
  if (pattern.endsWith("*")) {
    const base = pattern.slice(0, -1);
    return pathname === base || pathname.startsWith(base);
  }
  return pathname === pattern;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/|api/health).*)"],
};
