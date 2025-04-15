import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from './user.service';
import { ProfileService } from './profile.service';
import { RedisService } from 'src/redis/services/redis.service';
import mainConfig from 'src/common/config/main.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}
  async getSkills(search: string) {
    // تعامل مع حالة البحث الفارغ
    if (!search || search.trim() === '') {
      return this.prisma.skill.findMany({
        take: 6, // تحديد عدد النتائج لمنع استرجاع جميع البيانات
        orderBy: {
          name: 'asc',
        },
      });
    }

    // تنظيف مدخلات البحث
    const searchTerm = search.trim();

    // استخدام عوامل بحث متعددة للحصول على نتائج أفضل
    const skills = await this.prisma.skill.findMany({
      where: {
        OR: [
          // البحث باستخدام contains للعثور على أي تطابق جزئي
          { name: { contains: searchTerm, mode: 'insensitive' } },
          // البحث باستخدام startsWith للعثور على المهارات التي تبدأ بنص البحث
          { name: { startsWith: searchTerm, mode: 'insensitive' } },
        ],
      },
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
    if (skills.length === 0) {
      throw new NotFoundException(`No skills found matching "${searchTerm}"`);
    }

    return skills;
  }
  async getSkill(skillId: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id: skillId },
    });
    if (!skill) return {};
    return skill;
  }
}
