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
  constructor(
    private prisma: PrismaService,
  ) {}

  // ACTUALIZAR FOTO
  async actualizarFoto(
    id: number,
    foto: string,
  ) {
    await this.findOne(id);

    return this.prisma.mascotas.update({
      where: {
        id_mascota: id,
      },

      data: {
        foto,
      },
    });
  }

  // CREAR
  async create(
    dto: CreateMascotaDto,
  ) {
    const propietario =
      await this.prisma.propietarios.findUnique({
        where: {
          id_propietario:
            dto.id_propietario,
        },
      });

    if (!propietario) {
      throw new BadRequestException(
        'El propietario no existe',
      );
    }

    return this.prisma.mascotas.create({
      data: {
        nombre: dto.nombre,
        especie: dto.especie,
        raza: dto.raza,
        edad: dto.edad,
        peso: dto.peso,

        propietario: {
          connect: {
            id_propietario:
              dto.id_propietario,
          },
        },
      },
    });
  }

  // OBTENER TODAS
  async findAll(
    nombre?: string,
  ) {
    return this.prisma.mascotas.findMany({
      where: nombre
        ? {
            nombre: {
              contains: nombre,
              mode: 'insensitive',
            },
          }
        : undefined,

      include: {
        propietario: true,
      },
    });
  }

  // OBTENER UNA
  async findOne(id: number) {
    if (id <= 0) {
      throw new BadRequestException(
        'ID inválido',
      );
    }

    const mascota =
      await this.prisma.mascotas.findUnique({
        where: {
          id_mascota: id,
        },

        include: {
          propietario: true,
        },
      });

    if (!mascota) {
      throw new NotFoundException(
        'Mascota no encontrada',
      );
    }

    return mascota;
  }

  // ACTUALIZAR
  async updateMascota(
    id: number,
    dto: UpdateMascotaDto,
  ) {
    await this.findOne(id);

    return this.prisma.mascotas.update({
      where: {
        id_mascota: id,
      },

      data: dto,
    });
  }

  // ELIMINAR
  async deleteMascota(
    id: number,
  ) {
    await this.findOne(id);

    return this.prisma.mascotas.delete({
      where: {
        id_mascota: id,
      },
    });
  }
}