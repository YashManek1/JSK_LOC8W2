import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class JoinTeamDto {
  @IsString()
  @IsNotEmpty()
  inviteCode!: string;

  @IsObject()
  @IsOptional()
  dynamicAnswers?: Record<string, any>;
}
