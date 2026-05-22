import { IsNumber } from 'class-validator';

export class CreateFacturasDto {
  @IsNumber()
  total!: number;

  @IsNumber()
  id_propietario!: number;

  @IsNumber()
  id_mascota!: number;
}