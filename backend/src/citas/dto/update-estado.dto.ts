import {
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

import { EstadoCita } from '@prisma/client';

export class UpdateEstadoDto {

  @IsNotEmpty()
  @IsEnum(EstadoCita)
  estado: EstadoCita;
}