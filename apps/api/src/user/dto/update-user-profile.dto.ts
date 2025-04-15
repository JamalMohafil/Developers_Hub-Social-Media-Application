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
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SocialLinkDto } from './social-link.dto';

class SkillDto {
  @IsString()
  id: string;

  @IsString()
  name: string;
}

export class UpdateUserProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      'Username should only contain letters, numbers, and underscores with no spaces.',
  })
  username?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  jobTitle?: string;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @IsEmail({}, { message: 'Contact email must be valid' })
  @IsOptional()
  contactEmail?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  @ArrayMaxSize(10, { message: 'Maximum 10 skills allowed' })
  @IsOptional()
  skills?: SkillDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  @IsOptional()
  socialLinks?: SocialLinkDto[];
}
