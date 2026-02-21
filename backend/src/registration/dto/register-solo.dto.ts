import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class RegisterSoloDto {
  @IsString()
  @IsNotEmpty()
  hackathonId!: string;

  @IsObject()
  @IsOptional()
  dynamicAnswers?: Record<string, any>;
}
