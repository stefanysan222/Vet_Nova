import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateVacunaDto } from './dto/create-vacuna.dto';
import { UpdateVacunaDto } from './dto/update-vacuna.dto';

@Injectable()
export class VacunasService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateVacunaDto) {
    return this.prisma.vacunas.create({
      data: {
        nombre: dto.nombre,
        frecuencia_dias: dto.frecuencia_dias,
      },
    });
  }

  findAll() {
    return this.prisma.vacunas.findMany();
  }

  async findOne(id: number) {
    const vacuna = await this.prisma.vacunas.findUnique({
      where: { id_vacuna: id },
    });

    if (!vacuna) {
      throw new NotFoundException('Vacuna no encontrada');
    }

    return vacuna;
  }

  async update(id: number, dto: UpdateVacunaDto) {
    await this.findOne(id);

    return this.prisma.vacunas.update({
      where: { id_vacuna: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.vacunas.delete({
      where: { id_vacuna: id },
    });
  }
}