import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateMascotaDto } from './dto/create.mascota.dto';
import { UpdateMascotaDto } from './dto/update.mascotas.dto';

@Injectable()
export class MascotasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMascotaDto) {
    if (!dto.id_propietario) {
      throw new BadRequestException('Debes enviar id_propietario');
    }

    const propietario = await this.prisma.propietarios.findUnique({
      where: { id_propietario: dto.id_propietario },
    });

    if (!propietario) {
      throw new BadRequestException('El propietario no existe');
    }

    return this.prisma.mascotas.create({
      data: {
        nombre: dto.nombre,
        especie: dto.especie,
        raza: dto.raza,
        edad: dto.edad,
        propietario: {
          connect: { id_propietario: dto.id_propietario },
        },
      },
    });
  }

  findAll() {
    return this.prisma.mascotas.findMany({
      include: { propietario: true },
    });
  }

  async findOne(id: number) {
    const mascota = await this.prisma.mascotas.findUnique({
      where: { id_mascota: id },
      include: { propietario: true },
    });

    if (!mascota) {
      throw new NotFoundException('Mascota no encontrada');
    }

    return mascota;
  }

  async updateMascota(id: number, dto: UpdateMascotaDto) {
    await this.findOne(id);

    return this.prisma.mascotas.update({
      where: { id_mascota: id },
      data: dto,
    });
  }

  async deleteMascota(id: number) {
    await this.findOne(id);

    return this.prisma.mascotas.delete({
      where: { id_mascota: id },
    });
  }
}