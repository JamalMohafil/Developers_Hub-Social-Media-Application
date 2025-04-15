import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async updateOrCreateProfile(userId: string, updateUserProfileDto: any) {
    const { bio, location, company, jobTitle, website, contactEmail } =
      updateUserProfileDto;

    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return this.prisma.profile.update({
        where: { id: existingProfile.id },
        data: {
          bio,
          location,
          company,
          jobTitle,
          website,
          contactEmail,
        },
      });
    }

    return this.prisma.profile.create({
      data: {
        userId,
        bio,
        location,
        company,
        jobTitle,
        website,
        contactEmail,
      },
    });
  }

  async updateProfile(profileId: string, data: any) {
    return this.prisma.profile.update({
      where: { id: profileId },
      data,
      include: {
        skills: true,
        socialLinks: true,
      },
    });
  }

  async createProfile(userId: string, data: any) {
    return this.prisma.profile.create({
      data: { userId, ...data },
      include: {
        skills: true,
        socialLinks: true,
      },
    });
  }
 
  async updateSocialLinks(profileId: string, socialLinks: any[]) {
    await this.prisma.socialLink.deleteMany({
      where: { profileId },
    });

    for (const link of socialLinks) {
      await this.prisma.socialLink.create({
        data: { platform: link.platform, url: link.url, profileId },
      });
    }
  }
}
