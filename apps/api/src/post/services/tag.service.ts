import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/services/redis.service';

@Injectable()
export class TagService {
  // مدة صلاحية التخزين المؤقت: ساعة واحدة
  private readonly CACHE_TTL = 360000;

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async getTags(search: string) {
    // تنظيف مدخلات البحث
    const searchTerm = search?.trim() || '';

    // إنشاء مفتاح فريد للكاش
    const cacheKey = `tags:${searchTerm.toLowerCase() || 'all'}`;

    try {
      // 1. محاولة جلب البيانات من الكاش
      const cachedTags = await this.redisService.get(cacheKey);

      // 2. إذا وجدت البيانات، ارجعها مباشرة
      if (cachedTags) {
        return cachedTags;
      }

      // 3. إذا لم توجد بيانات في الكاش، ابحث في قاعدة البيانات
      let tags;

      if (!searchTerm) {
        tags = await this.prisma.tag.findMany({
          select: { id: true, name: true },
          take: 20,
          orderBy: { name: 'asc' },
        });
      } else {
        tags = await this.prisma.tag.findMany({
          where: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { name: { startsWith: searchTerm, mode: 'insensitive' } },
            ],
          },
          select: { id: true, name: true },
          orderBy: [{ name: 'asc' }],
          take: 20,
        });

        if (tags.length === 0) {
          throw new NotFoundException(`No tags found matching "${searchTerm}"`);
        }
      }

      // 4. تخزين النتائج في الكاش
      await this.redisService.set(cacheKey, tags, this.CACHE_TTL);

      return tags;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      // في حالة فشل، استمر بالعمل من قاعدة البيانات
      console.error('Redis caching error:', error);
      return this.fetchTagsFromDatabase(searchTerm);
    }
  }

  // دالة مساعدة تستخدم فقط في حالة فشل التخزين المؤقت
  private async fetchTagsFromDatabase(searchTerm: string) {
    if (!searchTerm) {
      return this.prisma.tag.findMany({
        select: { id: true, name: true },
        take: 20,
        orderBy: { name: 'asc' },
      });
    }

    const tags = await this.prisma.tag.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { name: { startsWith: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true },
      orderBy: [{ name: 'asc' }],
      take: 20,
    });

    if (tags.length === 0) {
      throw new NotFoundException(`No tags found matching "${searchTerm}"`);
    }

    return tags;
  }

  // دالة لمسح الكاش عند تحديث الوسوم
  async invalidateTagsCache() {
    try {
      const pattern = 'tags:*';
      const keys = await this.redisService.keys(pattern);

      // حذف جميع المفاتيح
      if (keys && keys.length > 0) {
        await Promise.all(keys.map((key) => this.redisService.del(key)));
      }
      return true;
    } catch (error) {
      console.error('Error invalidating tags cache:', error);
      return false;
    }
  }

  // استخدم هذه الدوال مع invalidateTagsCache عند إجراء تعديلات
  async createTag(data: { name: string }) {
    const tag = await this.prisma.tag.create({ data });
    await this.invalidateTagsCache();
    return tag;
  }

  async updateTag(id: string, data: { name: string }) {
    const tag = await this.prisma.tag.update({
      where: { id },
      data,
    });
    await this.invalidateTagsCache();
    return tag;
  }

  async deleteTag(id: string) {
    await this.prisma.tag.delete({ where: { id } });
    await this.invalidateTagsCache();
    return { success: true };
  }
}
