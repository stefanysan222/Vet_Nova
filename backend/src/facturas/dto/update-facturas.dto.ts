import { PartialType } from '@nestjs/mapped-types';
import { CreateFacturasDto } from './create-facturas.dto';

export class UpdateFacturasDto extends PartialType(CreateFacturasDto) {}