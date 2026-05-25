import { PartialType } from '@nestjs/swagger';
import { CreateHistoriasClinicaDto } from './create-historias-clinica.dto';

export class UpdateHistoriasClinicaDto extends PartialType(CreateHistoriasClinicaDto) {}
