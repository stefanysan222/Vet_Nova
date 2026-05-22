import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreatePropietarioDto } from './dto/create-propietario.dto';
import { UpdatePropietarioDto } from './dto/update-propietario.dto';

@Injectable()
export class PropietariosService {
  constructor(
    private prisma: PrismaService,
  ) {}

  // CREATE
  async create(
    createPropietarioDto: CreatePropietarioDto,
  ) {

    // Verificar email duplicado
    const existe =
      await this.prisma.propietarios.findFirst({
        where: {
          email: createPropietarioDto.email,
        },
      });

    if (existe) {
      throw new BadRequestException(
        'Ya existe un propietario con este email',
      );
    }

    return this.prisma.propietarios.create({
      data: {
        nombre: createPropietarioDto.nombre,
        telefono: createPropietarioDto.telefono,
        direccion: createPropietarioDto.direccion,
        email: createPropietarioDto.email,
      },
    });
  }

  // READ ALL
  async findAll(nombre?: string) {

    return this.prisma.propietarios.findMany({
      where: nombre
        ? {
            nombre: {
              contains: nombre,
              mode: 'insensitive',
            },
          }
        : undefined,

      include: {
        mascotas: true,
      },
    });
  }

  // READ ONE
  async findOne(id: number) {

    const propietario =
      await this.prisma.propietarios.findUnique({
        where: {
          id_propietario: id,
        },

        include: {
          mascotas: true,
        },
      });

    if (!propietario) {
      throw new NotFoundException(
        'Propietario no encontrado',
      );
    }

    return propietario;
  }

  // UPDATE
  async update(
    id: number,
    updatePropietarioDto: UpdatePropietarioDto,
  ) {

    await this.findOne(id);

    return this.prisma.propietarios.update({
      where: {
        id_propietario: id,
      },

      data: updatePropietarioDto,
    });
  }

  // DELETE
  async remove(id: number) {

    await this.findOne(id);

    return this.prisma.propietarios.delete({
      where: {
        id_propietario: id,
      },
    });
  }
}