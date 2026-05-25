import { IsNumber } from 'class-validator';

export class CreateHistoriasClinicaDto {
  @IsNumber()
  id_mascota!: number;
}