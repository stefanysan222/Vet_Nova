import { ApiProperty } from '@nestjs/swagger';

import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateRecordatorioDto {

  @ApiProperty({
    example: 'Aplicar vacuna anual',
    description: 'Mensaje del recordatorio',
  })

  @IsString()
  @IsNotEmpty()

  mensaje!: string;

  @ApiProperty({
    example: '2026-06-15',
    description: 'Fecha del recordatorio',
  })

  @IsDateString()

  fecha_recordatorio!: Date;

  @ApiProperty({
    example: 'PENDIENTE',
    description: 'Estado del recordatorio',
  })

  @IsString()
  @IsNotEmpty()

  estado!: string;

  @ApiProperty({
    example: 1,
    description: 'ID de la mascota',
  })

  @IsNumber()
  @IsPositive()

  id_mascota!: number;
}