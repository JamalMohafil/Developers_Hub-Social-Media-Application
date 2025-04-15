"use server";
import { authFetch } from "@/hooks/authFetch";
import { BACKEND_URL } from "@/lib/constants";

// إضافة تخزين مؤقت للاستجابات
const cache = new Map();
const CACHE_TTL = 5000; // 5 ثواني (يمكن تعديله حسب احتياجك)

export const likeCommentAction = async (commentId: string) => {
  try {
    // استخدام خيارات AbortController لإلغاء الطلبات التي تستغرق وقتًا طويلًا
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // حد زمني 3 ثواني

    // إضافة خيار keepalive لإعادة استخدام اتصالات TCP
    const res = await authFetch(
      `${BACKEND_URL}/post/like/comments/${commentId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // إضافة ترويسات للأداء
          Connection: "keep-alive",
          "Cache-Control": "no-cache",
        },
        signal: controller.signal,
        keepalive: true,
      }
    );

    clearTimeout(timeoutId);

    const data = await res.json();
    console.log(data);

    // تخزين النتيجة في الذاكرة المؤقتة
    cache.set(commentId, {
      data,
      timestamp: Date.now(),
    });

    return data;
  } catch (e: any) {
    console.error(`❌ Failed to like comment: ${e}`);

    // في حالة الفشل، تحقق إذا كان لدينا نسخة مخزنة مؤقتًا حديثة
    const cachedResponse = cache.get(commentId);
    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL) {
      return cachedResponse.data;
    }

    return e;
  }
};
