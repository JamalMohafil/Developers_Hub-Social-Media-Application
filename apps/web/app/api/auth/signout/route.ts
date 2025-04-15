// api/auth/signout/route.ts
import { revalidatePath } from "next/cache";
// import { deleteSession } from "../../../../lib/session";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // حذف الجلسة
    (await cookies()).delete("session");

    // إعادة التحقق من المسار مرة واحدة فقط
    revalidatePath("/", "layout");

    // توجيه المستخدم - هذا هو التوجيه الوحيد الذي نحتاجه
    return NextResponse.redirect(new URL("/", req.nextUrl));
  } catch (error) {
    console.error("خطأ أثناء تسجيل الخروج:", error);
    return NextResponse.json({ error: "فشل تسجيل الخروج" }, { status: 500 });
  }
}
// api/auth/signout/route.ts
// import { revalidatePath } from "next/cache";
// import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";

// export async function POST(req: NextRequest) {
//   try {
//     // حذف الجلسة
//     (await cookies()).delete("session");

//     // إعادة التحقق من المسار مرة واحدة فقط
//     // revalidatePath("/", "layout");

//     // توجيه المستخدم - هذا هو التوجيه الوحيد الذي نحتاجه
//     return { success: true };
//   } catch (error) {
//     console.error("خطأ أثناء تسجيل الخروج:", error);
//     return NextResponse.json({ error: "فشل تسجيل الخروج" }, { status: 500 });
//   }
// }
