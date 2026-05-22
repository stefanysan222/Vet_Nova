export class CreateConsultaDto {
  motivo?: string;
  diagnostico?: string;
  tratamiento?: string;

  id_historia!: number;
  id_usuario!: number;
}