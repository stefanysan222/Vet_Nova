import { PartialType } from '@nestjs/swagger';
import { CreateVacunaDto } from './create-vacuna.dto';

export class UpdateVacunaDto extends PartialType(CreateVacunaDto) {}
