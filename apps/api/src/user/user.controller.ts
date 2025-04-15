import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Put,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { Public } from 'src/auth/decoratores/public.decorator';
import { UserService } from './services/user.service';
import { UserProfileService } from './services/user-profile.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { AddProjectDto } from './dto/add-project.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SharpPipe } from 'src/common/pipes/share.pipe';
import { FollowService } from './services/follow.service';
import { ProjectsService } from './services/projects.service';
import { SkillsService } from './services/skills.service';
import { CheckUserGuard } from 'src/auth/guards/check-user/check-user.guard';
import { Request } from 'express';
import { UserNotificationService } from './services/userNotifications.service';
import { UserRepository } from './user.repository';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userNotificationService: UserNotificationService,
    private readonly userProfileService: UserProfileService,
    private readonly followService: FollowService,
    private readonly projectsService: ProjectsService,
    private readonly skillsService: SkillsService,
    private readonly userRepository: UserRepository,
  ) {}

  @Public()
  @Get('/profile/:id')
  getUserProfile(@Param('id') id: string, @Req() req: Request) {
    // access token
    const accessToken = this.userRepository.getAccessTokenFromHeaders(
      req.headers,
    );
    return this.userService.getUserProfile(id, accessToken);
  }

  @Public()
  @Get('/projects')
  getProjects(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('skillId') skillId: string,
    @Query('sortBy') sortBy: string,
  ) {
    return this.projectsService.getProjects(limit, page, sortBy, skillId);
  }

  @Put('/profile/:id')
  updateUserProfile(
    @Param('id') id: string,
    @Body() updateUserProfileDto: any,
    @Req() req,
  ) {
    return this.userProfileService.updateUserProfile(
      id,
      req.user,
      updateUserProfileDto,
    );
  }

  @Public()
  @Get('/skills')
  getSkills(@Query('search') search: string) {
    console.log(search);
    return this.skillsService.getSkills(search);
  }
  @Public()
  @Get('/skills/:skillId')
  getSkill(@Param("skillId") skillId:string) {
     return this.skillsService.getSkill(skillId);
  }

  @Post('/projects')
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: Math.pow(1024, 2) * 5 } }),
  )
  addProject(
    @UploadedFile(SharpPipe) image,
    @Req() req,
    @Body() addProjectDto: any,
  ) {
    return this.projectsService.addProject(req.user, addProjectDto, image);
  }

  @Post('/image')
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: Math.pow(1024, 2) * 5 } }),
  )
  updateUserImage(@UploadedFile(SharpPipe) image, @Req() req) {
    return this.userProfileService.updateUserImage(req.user.id, image);
  }

  @Put('/projects/:projectId')
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: Math.pow(1024, 2) * 5 } }),
  )
  updateProject(
    @UploadedFile(SharpPipe) image,
    @Param('projectId') projectId: string,
    @Req() req,
    @Body() updateProjectDto: any,
  ) {
    return this.projectsService.updateProject(
      req.user,
      image,
      updateProjectDto,
      projectId,
    );
  }

  @Delete('/projects/:projectId')
  deleteProject(@Param('projectId') projectId: string, @Req() req) {
    return this.projectsService.deleteProject(projectId, req.user);
  }
  @Public()
  @Get('/projects/:profileId')
  getUserProjects(
    @Param('profileId') profileId: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.projectsService.getUserProjects(profileId, limit, page);
  }
  @Public()
  @Get('/projects/project/:projectId')
  getProjectDetails(@Param('projectId') projectId: string) {
    return this.projectsService.getProjectDetails(projectId);
  }

  @Public()
  @Get('/:profileId/followers')
  getAllFollowingByUserId(
    @Param('profileId') profileId: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.followService.getAllFollowersByUserId(profileId, limit, page);
  }

  @Get('/notifications/count')
  getUserNotificationsCount(@Req() req) {
    return this.userNotificationService.getUserNotificationsCount(req.user);
  }
  @Get('/notifications')
  getUserNotifications(
    @Req() req,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.userNotificationService.getUserNotifications(
      req.user,
      limit,
      page,
    );
  }
  @Post('/notifications/mark-all-read')
  markAllNotificationsAsRead(@Req() req) {
    return this.userNotificationService.markAllNotificationsAsRead(req.user);
  }

  @Public()
  @Get('/:profileId/following')
  getAllFollowedByByUserId(
    @Param('profileId') profileId: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.followService.getAllFollowingByUserId(profileId, limit, page);
  }

  @Post('/follow/:profileId')
  async follow(@Param('profileId') profileId: string, @Req() req) {
    const result = await this.followService.follow(profileId, req.user);
    return result;
  }

  @Post('/unfollow/:profileId')
  async unfollow(@Param('profileId') profileId: string, @Req() req) {
    const result = await this.followService.unfollow(profileId, req.user);
    return result;
  }
}
