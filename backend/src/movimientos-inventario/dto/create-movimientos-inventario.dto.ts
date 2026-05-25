import { IsNumber, IsString } from 'class-validator';

export class CreateMovimientosInventarioDto {
  @IsString()
  tipo!: string;

  @IsNumber()
  cantidad!: number;

  @IsNumber()
  id_producto!: number;
}