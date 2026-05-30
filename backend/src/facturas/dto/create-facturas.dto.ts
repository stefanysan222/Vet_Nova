import { ApiProperty } from '@nestjs/swagger';

import {
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateFacturasDto {

  @ApiProperty({
    example: 150000,
    description: 'Total de la factura',
  })

  @IsNumber()
  @IsPositive()

  total!: number;

  @ApiProperty({
    example: 1,
    description: 'ID del propietario',
  })

  @IsNumber()
  @IsPositive()

  id_propietario!: number;

  @ApiProperty({
    example: 2,
    description: 'ID de la mascota',
  })

  @IsNumber()
  @IsPositive()

  id_mascota!: number;
}