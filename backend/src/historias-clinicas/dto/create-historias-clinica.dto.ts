import { ApiProperty } from '@nestjs/swagger';

import {
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateHistoriasClinicaDto {

  @ApiProperty({
    example: 1,
    description: 'ID de la mascota',
  })

  @IsNumber()
  @IsPositive()

  id_mascota!: number;
}