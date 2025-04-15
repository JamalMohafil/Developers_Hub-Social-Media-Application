import dynamic from "next/dynamic";
// استخدام التحميل الديناميكي لجميع المكونات
const HeroSection = dynamic(() => import("@/components/HeroSection"), {
  ssr: true, // تقديم على الخادم للعنصر الرئيسي للتحسين SEO
});

const FeaturesSection = dynamic(() => import("@/components/FeaturesSection"), {
  ssr: true, // تمكين SSR لضمان إنشاء المحتوى وقت البناء
});

const AnalyticsSection = dynamic(
  () => import("@/components/AnalayticsSection"),
  {
    ssr: true,
  }
);

const FeaturedProjects = dynamic(
  () => import("@/components/FeaturedProjects"),
  {
    ssr: true,
  }
);

const InviteWork = dynamic(() => import("@/components/InviteWork"), {
  ssr: true,
});

// تحويل الدالة إلى دالة عادية (غير متزامنة) لتكون متوافقة مع الصفحات الثابتة
export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* قسم البطاقة الرئيسية */}
      <HeroSection />

      {/* المحتوى الثانوي */}
      <div className="content-sections">
        {/* قسم الميزات */}
        <FeaturesSection />

        {/* إحصائيات المجتمع */}
        <AnalyticsSection />

        {/* المشاريع المميزة */}
        <FeaturedProjects />

        {/* قسم دعوة للعمل */}
        <InviteWork />
      </div>
    </div>
  );
}
