import { ApiProperty } from '@nestjs/swagger';

import {
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateDetalleProductoDto {

  @ApiProperty({
    example: 1,
    description: 'ID de la factura',
  })

  @IsNumber()
  @IsPositive()

  id_factura!: number;

  @ApiProperty({
    example: 2,
    description: 'ID del producto',
  })

  @IsNumber()
  @IsPositive()

  id_producto!: number;

  @ApiProperty({
    example: 3,
    description: 'Cantidad del producto',
  })

  @IsNumber()
  @IsPositive()

  cantidad!: number;

  @ApiProperty({
    example: 25000,
    description: 'Precio unitario del producto',
  })

  @IsNumber()
  @IsPositive()

  precio_unitario!: number;
}