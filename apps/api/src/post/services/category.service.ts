import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { RedisService } from 'src/redis/services/redis.service';
import mainConfig from 'src/common/config/main.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}
  async getCategories(search: string) {
    // تعامل مع حالة البحث الفارغ
    if (!search || search.trim() === '') {
      return this.prisma.category.findMany({
        select: { id: true, name: true },
        take: 20, // تحديد عدد النتائج لمنع استرجاع جميع البيانات
      });
    }

    // تنظيف مدخلات البحث
    const searchTerm = search.trim();

    // استخدام عوامل بحث متعددة للحصول على نتائج أفضل
    const categories = await this.prisma.category.findMany({
      where: {
        OR: [
          // البحث باستخدام contains للعثور على أي تطابق جزئي
          { name: { contains: searchTerm, mode: 'insensitive' } },
          // البحث باستخدام startsWith للعثور على المهارات التي تبدأ بنص البحث
          { name: { startsWith: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true },
      // ترتيب النتائج: الأولوية للمطابقات الدقيقة، ثم المطابقات التي تبدأ بنص البحث
      orderBy: [
        {
          name: 'asc',
        },
      ],
      // تحديد عدد النتائج لتحسين الأداء
      take: 20,
    });

    // تحسين رسالة الخطأ عند عدم وجود نتائج
    if (categories.length === 0) {
      throw new NotFoundException(`No skills found matching "${searchTerm}"`);
    }

    return categories;
  }
}
