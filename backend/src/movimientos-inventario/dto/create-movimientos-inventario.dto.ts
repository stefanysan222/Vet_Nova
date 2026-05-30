import { ApiProperty } from '@nestjs/swagger';

import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsPositive,
} from 'class-validator';

export class CreateMovimientosInventarioDto {

  @ApiProperty({
    example: 'ENTRADA',
    description: 'Tipo de movimiento de inventario',
  })

  @IsString()
  @IsNotEmpty()

  tipo!: string;

  @ApiProperty({
    example: 10,
    description: 'Cantidad del movimiento',
  })

  @IsNumber()
  @IsPositive()

  cantidad!: number;

  @ApiProperty({
    example: 1,
    description: 'ID del producto relacionado',
  })

  @IsNumber()
  @IsPositive()

  id_producto!: number;
}