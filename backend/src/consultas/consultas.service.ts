import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';

@Injectable()
export class ConsultasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateConsultaDto) {
    const historia =
      await this.prisma.historias_clinicas.findUnique({
        where: {
          id_historia: dto.id_historia,
        },
      });

    if (!historia) {
      throw new BadRequestException(
        'La historia clínica no existe',
      );
    }

    const usuario = await this.prisma.usuarios.findUnique({
      where: {
        id_usuario: dto.id_usuario,
      },
    });

    if (!usuario) {
      throw new BadRequestException(
        'El usuario no existe',
      );
    }

    return this.prisma.consultas.create({
      data: {
        motivo: dto.motivo,
        diagnostico: dto.diagnostico,
        tratamiento: dto.tratamiento,

        historias_clinicas: {
          connect: {
            id_historia: dto.id_historia,
          },
        },

        usuarios: {
          connect: {
            id_usuario: dto.id_usuario,
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.consultas.findMany({
      include: {
        historias_clinicas: true,
        usuarios: true,
      },
    });
  }

  async findOne(id: number) {
    const consulta = await this.prisma.consultas.findUnique({
      where: {
        id_consulta: id,
      },
      include: {
        historias_clinicas: true,
        usuarios: true,
      },
    });

    if (!consulta) {
      throw new NotFoundException(
        'Consulta no encontrada',
      );
    }

    return consulta;
  }

  async update(id: number, dto: UpdateConsultaDto) {
    await this.findOne(id);

    return this.prisma.consultas.update({
      where: {
        id_consulta: id,
      },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.consultas.delete({
      where: {
        id_consulta: id,
      },
    });
  }
}