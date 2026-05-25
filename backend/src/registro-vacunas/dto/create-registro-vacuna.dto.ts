import { IsDateString, IsNumber } from 'class-validator';

export class CreateRegistroVacunaDto {
  @IsDateString()
  fecha!: Date;

  @IsDateString()
  proxima_fecha!: Date;

  @IsNumber()
  id_mascota!: number;

  @IsNumber()
  id_vacuna!: number;
}