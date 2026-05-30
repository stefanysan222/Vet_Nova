import { PartialType } from '@nestjs/swagger';

import { CreateRegistroVacunaDto } from './create-registro-vacuna.dto';

export class UpdateRegistroVacunaDto extends PartialType(
  CreateRegistroVacunaDto,
) {}