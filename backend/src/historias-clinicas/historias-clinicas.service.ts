import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateHistoriasClinicaDto } from './dto/create-historias-clinica.dto';
import { UpdateHistoriasClinicaDto } from './dto/update-historias-clinica.dto';

@Injectable()
export class HistoriasClinicasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHistoriasClinicaDto) {
    const mascota = await this.prisma.mascotas.findUnique({
      where: { id_mascota: dto.id_mascota },
    });

    if (!mascota) {
      throw new BadRequestException('La mascota no existe');
    }

    const historiaExistente =
      await this.prisma.historias_clinicas.findUnique({
        where: { id_mascota: dto.id_mascota },
      });

    if (historiaExistente) {
      throw new BadRequestException(
        'La mascota ya tiene historia clínica',
      );
    }

    return this.prisma.historias_clinicas.create({
      data: {
        id_mascota: dto.id_mascota,
      },
      include: {
        mascotas: true,
      },
    });
  }

  async findAll() {
    return this.prisma.historias_clinicas.findMany({
      include: {
        mascotas: true,
        consultas: true,
      },
    });
  }

  async findOne(id: number) {
    const historia =
      await this.prisma.historias_clinicas.findUnique({
        where: { id_historia: id },
        include: {
          mascotas: true,
          consultas: true,
        },
      });

    if (!historia) {
      throw new NotFoundException(
        'Historia clínica no encontrada',
      );
    }

    return historia;
  }

  async update(
    id: number,
    dto: UpdateHistoriasClinicaDto,
  ) {
    await this.findOne(id);

    return this.prisma.historias_clinicas.update({
      where: { id_historia: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.historias_clinicas.delete({
      where: { id_historia: id },
    });
  }
}