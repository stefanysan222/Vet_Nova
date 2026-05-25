import { PartialType } from '@nestjs/swagger';
import { CreateDetalleProductoDto } from './create-detalle-producto.dto';

export class UpdateDetalleProductoDto extends PartialType(CreateDetalleProductoDto) {}
