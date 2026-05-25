import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateConsultaDto {
  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsString()
  tratamiento?: string;

  @IsNumber()
  id_historia!: number;

  @IsNumber()
  id_usuario!: number;
}