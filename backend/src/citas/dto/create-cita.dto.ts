import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  Min,
  IsEnum,
} from 'class-validator';

import { EstadoCita } from '@prisma/client';

export class CreateCitaDto {

  @IsDateString()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  hora: string;

  @IsOptional()
  @IsEnum(EstadoCita)
  estado?: EstadoCita;

  @IsInt()
  @Min(1)
  id_mascota: number;

  @IsInt()
  @Min(1)
  id_usuario: number;

  @IsOptional()
  @IsString()
  descripcion?: string;
}