import { ApiProperty } from '@nestjs/swagger';

import {
  IsDateString,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateRegistroVacunaDto {

  @ApiProperty({
    example: '2026-05-28',
    description: 'Fecha de aplicación de la vacuna',
  })

  @IsDateString()

  fecha!: Date;

  @ApiProperty({
    example: '2027-05-28',
    description: 'Próxima fecha de vacunación',
  })

  @IsDateString()

  proxima_fecha!: Date;

  @ApiProperty({
    example: 1,
    description: 'ID de la mascota',
  })

  @IsNumber()
  @IsPositive()

  id_mascota!: number;

  @ApiProperty({
    example: 2,
    description: 'ID de la vacuna',
  })

  @IsNumber()
  @IsPositive()

  id_vacuna!: number;
}