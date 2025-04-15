import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from './user.service';
import { ProfileService } from './profile.service';
import { RedisService } from 'src/redis/services/redis.service';
import mainConfig from 'src/common/config/main.config';
import { ConfigType } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { UserRepository } from '../user.repository';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
  ) {}

  async addProject(user: any, addProjectDto: any, image: string) {
    const imageUrl = this.userRepository.getImageUrl(image);

    if (!user) throw new NotFoundException('User not found');

    const profile = await this.userService.getUserProfile(user.id);

    const { skills: JsonSkills, ...projectData } = addProjectDto;
    const skills = JSON.parse(JsonSkills);
    const createdProject = await this.prisma.project.create({
      data: {
        ...projectData,
        image: imageUrl,
        profile: {
          connect: { id: profile.id },
        },
        // إذا كانت هناك مهارات، قم بعمل connect لها
        ...(skills && skills.length > 0
          ? {
              skills: {
                connect: skills.map((skill) => ({ id: skill.id })),
              },
            }
          : {}),
      },
      include: {
        skills: true,
      },
    });

    return createdProject;
  }
  async updateProject(
    user: any,
    image: string,
    updateProjectDto: any,
    projectId: string,
  ) {
    const userProfile = await this.userService.getUserProfile(user.id);

    const currentProject = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { profileId: true, image: true, skills: true },
    });
    if (!currentProject) {
      throw new NotFoundException('Project Not found');
    }
    if (currentProject?.profileId !== userProfile?.id) {
      throw new UnauthorizedException(
        'You are not allowed to update this project',
      );
    }

    const imageUrl = image
      ? this.userRepository.getImageUrl(image)
      : currentProject.image;

    const { skills: JsonSkills, ...updateDto } = updateProjectDto;
    let skills;
    if (JsonSkills) {
      skills = JSON.parse(JsonSkills);
    }
    let updateData: Prisma.ProjectUpdateInput = {
      ...updateDto,
      image: imageUrl,
    };

    if (skills && skills.length > 0) {
      // استخراج معرفات المهارات الحالية والجديدة
      const currentSkillIds = currentProject.skills.map((skill) => skill.id);
      const newSkillIds = skills.map((skill) => skill.id);

      // تحديد المهارات التي يجب إزالتها (موجودة في القديمة وليست في الجديدة)
      const skillsToDisconnect = currentProject.skills
        .filter((skill) => !newSkillIds.includes(skill.id))
        .map((skill) => ({ id: skill.id }));

      // تحديد المهارات التي يجب إضافتها (موجودة في الجديدة وليست في القديمة)
      const skillsToConnect = skills
        .filter((skill) => !currentSkillIds.includes(skill.id))
        .map((skill) => ({ id: skill.id }));

      // تحديث البيانات فقط إذا كان هناك تغيير
      if (skillsToDisconnect.length > 0 || skillsToConnect.length > 0) {
        updateData.skills = {};

        if (skillsToDisconnect.length > 0) {
          updateData.skills.disconnect = skillsToDisconnect;
        }

        if (skillsToConnect.length > 0) {
          updateData.skills.connect = skillsToConnect;
        }
      } else {
      }
    }

    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: { skills: true },
    });

    return updatedProject;
  }
  async deleteProject(projectId: string, user: any) {
    try {
      const userProfile = await this.userService.getUserProfile(user.id);

      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (userProfile.id !== project?.profileId) {
        throw new UnauthorizedException('Unauthorized');
      }

      await this.prisma.project.delete({ where: { id: projectId } });

      return new HttpException('Deleted successfully', 200);
    } catch (e) {
      return new BadRequestException(
        'Unexpected problem occured, try again later',
      );
    }
  }

  async getUserProjects(profileId: string, limit: number, page: number) {
    const skip = (page - 1) * limit;
    const projects = await this.prisma.project.findMany({
      where: {
        profileId: profileId,
      },
      include: {
        skills: true,
      },
      take: limit,
      skip: skip,
    });
    const totalProjects = await this.prisma.project.count({
      where: { profileId: profileId },
    });
    const totalPages = Math.ceil(totalProjects / limit);
    return {
      projects,
      pagination: {
        total: totalProjects,
        pages: totalPages,
        page: page,
        limit: limit,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }
  async getProjects(
    limit: number,
    page: number,
    sortBy: string,
    skillId?: string,
  ) {
    const sortValue = sortBy === 'asc' ? 'asc' : 'desc';
    const skip = (page - 1) * limit;
    const projects = await this.prisma.project.findMany({
      include: {
        skills: true,
      },
      take: limit,
      skip: skip,
      orderBy: {
        createdAt: sortValue,
      },
      ...(skillId && { where: { skills: { some: { id: skillId } } } }),
    });
    const totalProjects = await this.prisma.project.count();
    const totalPages = Math.ceil(totalProjects / limit);
    return {
      projects,
      pagination: {
        total: totalProjects,
        pages: totalPages,
        page: page,
        limit: limit,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }
  async getProjectDetails(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        skills: true,
      },
    });
    if (!project) throw new NotFoundException('Project not found');

    const profile = await this.prisma.profile.findUnique({
      where: {
        id: project.profileId,
      },
      include: { user: true },
    });
    const lastProjects = await this.prisma.project.findMany({
      where: { profileId: project.profileId, NOT: { id: project.id } },
      take: 3,
    });
    return { project, profile, lastProjects };
  }
}
