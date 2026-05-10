import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Rol } from '@prisma/client';

export class RegisterDto {
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsEnum([
    'ADMIN',
    'VETERINARIO',
    'RECEPCIONISTA',
    'CLIENTE',
  ])
  rol: Rol;
}