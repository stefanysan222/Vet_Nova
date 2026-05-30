import { ApiProperty } from '@nestjs/swagger';

import {
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
} from 'class-validator';

export class CreateConsultaDto {

  @ApiProperty({
    example: 'Fiebre y vómito',
    description: 'Motivo de la consulta',
    required: false,
  })

  @IsOptional()
  @IsString()

  motivo?: string;

  @ApiProperty({
    example: 'Infección estomacal',
    description: 'Diagnóstico veterinario',
    required: false,
  })

  @IsOptional()
  @IsString()

  diagnostico?: string;

  @ApiProperty({
    example: 'Medicamentos y dieta blanda',
    description: 'Tratamiento recomendado',
    required: false,
  })

  @IsOptional()
  @IsString()

  tratamiento?: string;

  @ApiProperty({
    example: 1,
    description: 'ID de la historia clínica',
  })

  @IsNumber()
  @IsPositive()

  id_historia!: number;

  @ApiProperty({
    example: 2,
    description: 'ID del veterinario o usuario',
  })

  @IsNumber()
  @IsPositive()

  id_usuario!: number;
}