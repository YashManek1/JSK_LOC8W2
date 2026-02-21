import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class DomainDto {
  @IsString()
  name!: string;

  @IsArray()
  @IsString({ each: true })
  problems!: string[];
}

class RoomDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  capacity?: string;
}

class TimelineDto {
  @IsString()
  time!: string;

  @IsString()
  event!: string;
}

export class CreateHackathonDto {
  @IsString()
  name!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  location!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  posterUrl?: string; // Expecting frontend to upload file and pass URL

  @IsString()
  @IsOptional()
  prizePool?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  totalTeams?: number;

  @IsNumber()
  @Type(() => Number)
  teamSize!: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  totalOfflineTeams?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  totalRemoteTeams?: number;

  @IsString()
  @IsOptional()
  venueMapUrl?: string;

  @IsBoolean()
  @IsOptional()
  ndaRequired?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sponsors?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  rules?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DomainDto)
  @IsOptional()
  domains?: DomainDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomDto)
  @IsOptional()
  roomsList?: RoomDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimelineDto)
  @IsOptional()
  timeline?: TimelineDto[];
}
