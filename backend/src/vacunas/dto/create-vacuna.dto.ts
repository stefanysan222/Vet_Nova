import { ApiProperty } from '@nestjs/swagger';

import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateVacunaDto {

  @ApiProperty({
    example: 'Rabia',
    description: 'Nombre de la vacuna',
  })

  @IsString()
  @IsNotEmpty()

  nombre!: string;

  @ApiProperty({
    example: 365,
    description: 'Frecuencia en días de aplicación',
  })

  @IsNumber()
  @IsPositive()

  frecuencia_dias!: number;
}