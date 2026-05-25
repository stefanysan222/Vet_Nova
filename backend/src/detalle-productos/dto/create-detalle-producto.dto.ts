import { IsNumber } from 'class-validator';

export class CreateDetalleProductoDto {
  @IsNumber()
  id_factura!: number;

  @IsNumber()
  id_producto!: number;

  @IsNumber()
  cantidad!: number;

  @IsNumber()
  precio_unitario!: number;
}