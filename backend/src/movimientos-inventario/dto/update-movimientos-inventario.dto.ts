import { PartialType } from '@nestjs/swagger';

import { CreateMovimientosInventarioDto } from './create-movimientos-inventario.dto';

export class UpdateMovimientosInventarioDto extends PartialType(
  CreateMovimientosInventarioDto,
) {}