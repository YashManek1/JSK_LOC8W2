import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class ScoreDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  innovation?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  feasibility?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  techDepth?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  clarity?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  impact?: number;
}
