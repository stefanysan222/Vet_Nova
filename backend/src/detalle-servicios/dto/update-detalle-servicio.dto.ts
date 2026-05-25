import { PartialType } from '@nestjs/swagger';
import { CreateDetalleServicioDto } from './create-detalle-servicio.dto';

export class UpdateDetalleServicioDto extends PartialType(CreateDetalleServicioDto) {}
