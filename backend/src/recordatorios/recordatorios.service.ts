import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateRecordatorioDto } from './dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto';

@Injectable()
export class RecordatoriosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRecordatorioDto) {
    const mascota = await this.prisma.mascotas.findUnique({
      where: { id_mascota: dto.id_mascota },
    });

    if (!mascota) {
      throw new BadRequestException('La mascota no existe');
    }

    return this.prisma.recordatorios.create({
      data: {
        mensaje: dto.mensaje,
        fecha_recordatorio: dto.fecha_recordatorio,
        estado: dto.estado,
        mascotas: {
          connect: {
            id_mascota: dto.id_mascota,
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.recordatorios.findMany({
      include: {
        mascotas: true,
      },
    });
  }

  async findOne(id: number) {
    const recordatorio = await this.prisma.recordatorios.findUnique({
      where: { id_recordatorio: id },
      include: {
        mascotas: true,
      },
    });

    if (!recordatorio) {
      throw new NotFoundException('Recordatorio no encontrado');
    }

    return recordatorio;
  }

  async update(id: number, dto: UpdateRecordatorioDto) {
    await this.findOne(id);

    return this.prisma.recordatorios.update({
      where: { id_recordatorio: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.recordatorios.delete({
      where: { id_recordatorio: id },
    });
  }
}