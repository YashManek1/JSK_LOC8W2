import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  passwordHash!: string; // Typically would be just 'password' and hashed by service, but aligning with Prisma for now or assuming pre-hashed. Let's assume raw password and hash it in service.

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
