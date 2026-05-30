import { ApiProperty } from '@nestjs/swagger';

import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateProductoDto {

  @ApiProperty({
    example: 'Antipulgas',
    description: 'Nombre del producto',
  })

  @IsString()
  @IsNotEmpty()

  nombre!: string;

  @ApiProperty({
    example: 'Medicamento',
    description: 'Tipo de producto',
  })

  @IsString()
  @IsNotEmpty()

  tipo!: string;

  @ApiProperty({
    example: 25000,
    description: 'Precio del producto',
  })

  @IsNumber()
  @IsPositive()

  precio!: number;

  @ApiProperty({
    example: 15,
    description: 'Cantidad disponible',
  })

  @IsNumber()
  @IsPositive()

  stock!: number;
}