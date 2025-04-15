import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  ValidateNested,
  IsArray,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SocialLinkDto } from './social-link.dto';
import { SkillDto } from './skill.dto';

export class AddProjectDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  projectUrl?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  @ArrayMaxSize(10, { message: 'Maximum 10 skills allowed' })
  @IsOptional()
  skills?: SkillDto[];
}
