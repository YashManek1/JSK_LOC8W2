import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDiscussionDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsOptional()
  tags?: string;
}
