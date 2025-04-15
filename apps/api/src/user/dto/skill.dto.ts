import { IsString } from "class-validator";

export class SkillDto {
  @IsString()
  id: string;

  @IsString()
  name: string;
}
