import { IsString, IsUrl } from 'class-validator';

export class SocialLinkDto {
  @IsString()
  platform: string;

  @IsString()
  @IsUrl()
  url: string;
}