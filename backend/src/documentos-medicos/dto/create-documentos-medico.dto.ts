import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDocumentoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;
}