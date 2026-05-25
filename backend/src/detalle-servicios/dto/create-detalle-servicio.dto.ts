import { IsNumber } from 'class-validator';

export class CreateDetalleServicioDto {
  @IsNumber()
  id_factura!: number;

  @IsNumber()
  id_servicio!: number;

  @IsNumber()
  cantidad!: number;

  @IsNumber()
  precio_unitario!: number;
}