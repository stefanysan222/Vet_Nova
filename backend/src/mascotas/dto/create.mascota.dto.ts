import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';

export class CreateMascotaDto {

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  especie: string;

  @IsString()
  @IsNotEmpty()
  raza: string;

  @IsInt()
  @Min(0)
  edad: number;

  @IsNumber()
  @Min(0)
  peso: number;

  @IsInt()
  @Min(1)
  id_propietario: number;
}