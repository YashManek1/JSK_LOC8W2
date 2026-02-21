import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  hackathonId!: string;

  @IsString()
  @IsNotEmpty()
  teamName!: string;

  @IsObject()
  @IsOptional()
  dynamicAnswers?: Record<string, any>;
}
