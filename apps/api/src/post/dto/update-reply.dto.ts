import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateReplyDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
