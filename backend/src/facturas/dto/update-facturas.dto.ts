import { PartialType } from '@nestjs/swagger';

import { CreateFacturasDto } from './create-facturas.dto';

export class UpdateFacturasDto extends PartialType(
  CreateFacturasDto,
) {}