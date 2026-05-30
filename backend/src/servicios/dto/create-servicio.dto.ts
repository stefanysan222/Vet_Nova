import { ApiProperty } from '@nestjs/swagger';

import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateServicioDto {

  @ApiProperty({
    example: 'Consulta veterinaria',
    description: 'Nombre del servicio',
  })

  @IsString()
  @IsNotEmpty()

  nombre!: string;

  @ApiProperty({
    example: 50000,
    description: 'Precio del servicio',
  })

  @IsNumber()
  @IsPositive()

  precio!: number;
}