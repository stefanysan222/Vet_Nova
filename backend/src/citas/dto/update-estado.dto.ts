import { IsEnum } from 'class-validator';

import { EstadoCita } from '@prisma/client';

export class UpdateEstadoDto {

  @IsEnum(EstadoCita)

  estado: EstadoCita;
}