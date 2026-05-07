import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePropietarioDto {

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  telefono: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}