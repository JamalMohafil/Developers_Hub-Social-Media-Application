import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfileService } from './profile.service';
import { UserService } from './user.service';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { RedisService } from 'src/redis/services/redis.service';
import { Prisma } from '@prisma/client';
import { AddProjectDto } from '../dto/add-project.dto';
import mainConfig from 'src/common/config/main.config';
import { ConfigType } from '@nestjs/config';
import { UserAuthService } from 'src/auth/services/user-auth.service';
import { UserRepository } from '../user.repository';

@Injectable()
export class UserProfileService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
  ) {}
  async updateUserProfile(
    userId: string,
    user: any,
    updateUserProfileDto: UpdateUserProfileDto,
  ) {
    // 2. التحقق من توفر اسم المستخدم خارج المعاملة إذا تم تغييره
    const { username } = updateUserProfileDto;
    await this.userRepository.checkUsernameAvailability(
      username || '',
      user.id,
    );

    // 3. بدء المعاملة مع زيادة مهلة الانتهاء
    return this.prisma
      .$transaction(
        async (prismaTransaction) => {
          const {
            name,
            bio,
            location,
            company,
            jobTitle,
            website,
            contactEmail,
            skills,
            socialLinks,
          } = updateUserProfileDto;

          // تحديث بيانات المستخدم
          const updatedUser = await prismaTransaction.user.update({
            where: { id: userId },
            data: {
              name: name ?? user.name,
              username: username ?? user.username,
            },
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              emailVerified: true,
            },
          });

          // البحث عن الملف الشخصي الحالي بإستعلام واحد
          const existingProfile = await prismaTransaction.profile.findUnique({
            where: { userId },
            include: {
              skills: true,
              socialLinks: true,
            },
          });

          // إعداد بيانات الملف الشخصي
          const profileData: Prisma.ProfileUpdateInput = {};

          // إضافة البيانات فقط إذا تم توفيرها
          if (bio !== undefined) profileData.bio = bio;
          if (location !== undefined) profileData.location = location;
          if (company !== undefined) profileData.company = company;
          if (jobTitle !== undefined) profileData.jobTitle = jobTitle;
          if (website !== undefined) profileData.website = website;
          if (contactEmail !== undefined)
            profileData.contactEmail = contactEmail;

          // إنشاء أو تحديث الملف الشخصي في عملية واحدة
          let profile;
          if (existingProfile) {
            profile = await prismaTransaction.profile.update({
              where: { id: existingProfile.id },
              data: profileData,
            });
          }

          // 4. معالجة المهارات بطريقة محسنة - تحديث فقط ما تغير
          if (skills) {
            const existingSkillIds =
              existingProfile?.skills?.map((skill) => skill.id) || [];
            const newSkillIds = skills.map((skill) => skill.id);

            // تحديد المهارات للإضافة والحذف
            const skillsToConnect = skills
              .filter((skill) => !existingSkillIds.includes(skill.id))
              .map((skill) => ({ id: skill.id }));

            const skillsToDisconnect =
              existingProfile?.skills
                ?.filter((skill) => !newSkillIds.includes(skill.id))
                .map((skill) => ({ id: skill.id })) || [];

            // تنفيذ التحديثات فقط إذا كانت هناك تغييرات
            if (skillsToConnect.length > 0 || skillsToDisconnect.length > 0) {
              // تصحيح: التأكد من أن كائن skills موجود قبل إضافة الخصائص
              const updateData: Prisma.ProfileUpdateInput = {};

              // إضافة كائن skills إذا كان هناك skills للربط أو الفصل
              updateData.skills = {};

              if (skillsToConnect.length > 0) {
                updateData.skills.connect = skillsToConnect;
              }

              if (skillsToDisconnect.length > 0) {
                updateData.skills.disconnect = skillsToDisconnect;
              }

              await prismaTransaction.profile.update({
                where: { id: profile.id },
                data: updateData,
              });
            }
          }

          // 5. معالجة الروابط الاجتماعية بطريقة محسنة - تحديث فقط ما تغير
          if (socialLinks) {
            const existingSocialLinks = existingProfile?.socialLinks || [];

            // إنشاء فهارس للمقارنة السريعة
            const existingLinksMap = new Map(
              existingSocialLinks.map((link) => [
                `${link.platform}-${link.url}`,
                link,
              ]),
            );

            const newLinksMap = new Map(
              socialLinks.map((link) => [`${link.platform}-${link.url}`, link]),
            );

            // تحديد الروابط للإضافة والحذف والتحديث
            const linksToCreate = socialLinks.filter(
              (link) => !existingLinksMap.has(`${link.platform}-${link.url}`),
            );

            const linksToDelete = existingSocialLinks.filter(
              (link) => !newLinksMap.has(`${link.platform}-${link.url}`),
            );

            // تنفيذ عمليات الحذف فقط للروابط التي تم إزالتها
            if (linksToDelete.length > 0) {
              await prismaTransaction.socialLink.deleteMany({
                where: {
                  id: { in: linksToDelete.map((link) => link.id) },
                },
              });
            }

            // إنشاء الروابط الجديدة فقط
            if (linksToCreate.length > 0) {
              await prismaTransaction.socialLink.createMany({
                data: linksToCreate.map((link) => ({
                  platform: link.platform,
                  url: link.url,
                  profileId: profile.id,
                })),
              });
            }
          }

          // 6. إعادة بيانات المستخدم والملف الشخصي من المعاملة
          return {
            id: profile.id,
            user: updatedUser,
            userId: profile.userId,
          };
        },
        {
          timeout: 15000, // زيادة المهلة إلى 15 ثانية للتأكد من إتمام جميع العمليات
        },
      )
      .then(async (profileResult) => {
        // 7. جلب البيانات النهائية بعد انتهاء المعاملة
        const finalProfile = await this.prisma.profile.findUnique({
          where: { id: profileResult.id },
          include: {
            user: true,
            skills: true,
            socialLinks: true,
          },
        });

        if (!finalProfile) {
          throw new NotFoundException('Profile not found after update');
        }

        // 8. تحديث ذاكرة التخزين المؤقت Redis
        const userCacheKey = `user:${userId}`;
        const profileCacheKey = `profile:${finalProfile.userId}`;

        // استخدام Promise.all هنا آمن لأن جميع الوعود من نفس النوع
        await Promise.all([
          this.redisService.del(userCacheKey),
          this.redisService.del(profileCacheKey),
        ]);
        await Promise.all([
          this.redisService.set(userCacheKey, finalProfile.user, 3600),
          this.redisService.set(profileCacheKey, finalProfile, 3600),
        ]);

        return finalProfile;
      });
  }
  async updateUserImage(userId: string, image: string) {
    const imageUrl = this.userRepository.getImageUrl(image);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    });
    const cachedUserKey = `user:${userId}`;
    const cachedProfileKey = `profile:${userId}`;
    const cachedUser = await this.redisService.get(cachedUserKey);
    const cachedProfile = await this.redisService.get(cachedProfileKey);
    if (cachedUser) {
      await this.redisService.del(cachedUserKey);
      await this.redisService.set(cachedUserKey, updatedUser, 3600);
    }

    if (cachedProfile) {
      const profile = await this.prisma.profile.findUnique({
        where: { userId: userId },
        include: {
          user: true,
          skills: true,
          socialLinks: true,
        },
      });
      await this.redisService.del(cachedProfileKey);
      await this.redisService.set(cachedProfileKey, profile, 3600);
    }

    return updatedUser;
  }
}
