import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateDocumentoDto } from './dto/create-documentos-medico.dto';

@Injectable()
export class DocumentosMedicosService {
  constructor(
    private prisma: PrismaService,
  ) {}

  // CREAR DOCUMENTO
  async crear(
    idMascota: number,
    dto: CreateDocumentoDto,
    url: string,
  ) {

    const mascota =
      await this.prisma.mascotas.findUnique({
        where: {
          id_mascota: idMascota,
        },
      });

    if (!mascota) {
      throw new NotFoundException(
        'La mascota no existe',
      );
    }

    return this.prisma.documentos_medicos.create({
      data: {
        nombre: dto.nombre,
        tipo: dto.tipo,
        url: url,

        mascota: {
          connect: {
            id_mascota: idMascota,
          },
        },
      },
    });
  }

  // OBTENER DOCUMENTOS POR MASCOTA
  async findByMascota(
    idMascota: number,
  ) {

    const mascota =
      await this.prisma.mascotas.findUnique({
        where: {
          id_mascota: idMascota,
        },
      });

    if (!mascota) {
      throw new NotFoundException(
        'La mascota no existe',
      );
    }

    return this.prisma.documentos_medicos.findMany({
      where: {
        id_mascota: idMascota,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}