import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

import { Rol } from '@prisma/client';

export class RegisterDto {

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  nombre: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(30)
  password: string;

  @IsEnum(Rol)
  rol: Rol;
}