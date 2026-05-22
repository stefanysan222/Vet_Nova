import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePropietarioDto {

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  telefono: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}