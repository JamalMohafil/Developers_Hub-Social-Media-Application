// src/auth/dto/user.dto.ts

import { Role } from '@prisma/client';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class LoginDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  
  username?: string;

  @IsOptional()
  role?: Role;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  oauthId?: string;

  @IsOptional()
  @IsString()
  image?: string;
}
