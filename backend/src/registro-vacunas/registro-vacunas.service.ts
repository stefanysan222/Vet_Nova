import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateRegistroVacunaDto } from './dto/create-registro-vacuna.dto';
import { UpdateRegistroVacunaDto } from './dto/update-registro-vacuna.dto';

@Injectable()
export class RegistroVacunasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRegistroVacunaDto) {
    const mascota = await this.prisma.mascotas.findUnique({
      where: { id_mascota: dto.id_mascota },
    });

    if (!mascota) {
      throw new BadRequestException(
        'La mascota no existe',
      );
    }

    const vacuna = await this.prisma.vacunas.findUnique({
      where: { id_vacuna: dto.id_vacuna },
    });

    if (!vacuna) {
      throw new BadRequestException(
        'La vacuna no existe',
      );
    }

    return this.prisma.registro_vacunas.create({
      data: {
        fecha: dto.fecha,
        proxima_fecha: dto.proxima_fecha,
        id_mascota: dto.id_mascota,
        id_vacuna: dto.id_vacuna,
      },
      include: {
        mascotas: true,
        vacunas: true,
      },
    });
  }

  async findAll() {
    return this.prisma.registro_vacunas.findMany({
      include: {
        mascotas: true,
        vacunas: true,
      },
    });
  }

  async findOne(id: number) {
    const registro =
      await this.prisma.registro_vacunas.findUnique({
        where: { id_registro: id },
        include: {
          mascotas: true,
          vacunas: true,
        },
      });

    if (!registro) {
      throw new NotFoundException(
        'Registro de vacuna no encontrado',
      );
    }

    return registro;
  }

  async update(
    id: number,
    dto: UpdateRegistroVacunaDto,
  ) {
    await this.findOne(id);

    return this.prisma.registro_vacunas.update({
      where: { id_registro: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.registro_vacunas.delete({
      where: { id_registro: id },
    });
  }
}