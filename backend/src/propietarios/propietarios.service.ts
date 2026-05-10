import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreatePropietarioDto } from './dto/create-propietario.dto';
import { UpdatePropietarioDto } from './dto/update-propietario.dto';

@Injectable()
export class PropietariosService {

  constructor(private prisma: PrismaService) {}

  // CREATE
  async create(createPropietarioDto: CreatePropietarioDto) {

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
  findAll(nombre?: string) {
    return this.prisma.propietarios.findMany({
      where: nombre
        ? {
            nombre: {
              contains: nombre,
              mode: 'insensitive',
            },
          }
        : {},
    });
  }

  // READ ONE
  findOne(id: number) {
    return this.prisma.propietarios.findUnique({
      where: {
        id_propietario: id,
      },
      include: {
        mascotas: true,
      },
    });
  }

  // UPDATE
  update(id: number, updatePropietarioDto: UpdatePropietarioDto) {

    return this.prisma.propietarios.update({
      where: {
        id_propietario: id,
      },
      data: updatePropietarioDto,
    });
  }

  // DELETE
  remove(id: number) {

    return this.prisma.propietarios.delete({
      where: {
        id_propietario: id,
      },
    });
  }
}