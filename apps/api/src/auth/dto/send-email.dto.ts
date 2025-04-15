import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  from: string;

  @IsEmail()
  to: string;

  @IsString()
  html: string;

  @IsOptional()
  @IsString()
  text?: string;
}
