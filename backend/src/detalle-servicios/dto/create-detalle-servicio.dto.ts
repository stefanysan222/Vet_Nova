import { ApiProperty } from '@nestjs/swagger';

import {
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateDetalleServicioDto {

  @ApiProperty({
    example: 1,
    description: 'ID de la factura',
  })

  @IsNumber()
  @IsPositive()

  id_factura!: number;

  @ApiProperty({
    example: 2,
    description: 'ID del servicio',
  })

  @IsNumber()
  @IsPositive()

  id_servicio!: number;

  @ApiProperty({
    example: 1,
    description: 'Cantidad del servicio',
  })

  @IsNumber()
  @IsPositive()

  cantidad!: number;

  @ApiProperty({
    example: 50000,
    description: 'Precio unitario del servicio',
  })

  @IsNumber()
  @IsPositive()

  precio_unitario!: number;
}