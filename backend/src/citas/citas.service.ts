import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateCitaDto } from './dto/create-cita.dto';

import { EstadoCita } from '@prisma/client';

@Injectable()
export class CitasService {
  constructor(private prisma: PrismaService) {}

  
  async create(dto: CreateCitaDto) {

  
    const mascota =
      await this.prisma.mascotas.findUnique({
        where: {
          id_mascota: dto.id_mascota,
        },
      });

    if (!mascota) {
      throw new BadRequestException(
        'La mascota no existe',
      );
    }

    
    const usuario =
      await this.prisma.usuarios.findUnique({
        where: {
          id_usuario: dto.id_usuario,
        },
      });

    if (!usuario) {
      throw new BadRequestException(
        'El usuario no existe',
      );
    }

    
    const citaExistente =
      await this.prisma.citas.findFirst({
        where: {
          fecha: new Date(dto.fecha),
          hora: dto.hora,
          estado: EstadoCita.pendiente,
        },
      });

    if (citaExistente) {
      throw new BadRequestException(
        'Ya existe una cita agendada en ese horario',
      );
    }

    
    return this.prisma.citas.create({
      data: {
        fecha: new Date(dto.fecha),
        hora: dto.hora,
        estado: EstadoCita.pendiente,
        id_mascota: dto.id_mascota,
        id_usuario: dto.id_usuario,
        descripcion: dto.descripcion,
      },
    });
    
    } 
    
    findAll(estado?: EstadoCita) {
      return this.prisma.citas.findMany({
        where: estado ? { estado } : {},
        include: {
          mascotas: true,
          usuarios: true,
        },
      });
    }

  
  async findOne(id: number) {

    const cita = await this.prisma.citas.findUnique({
      where: {
        id_cita: id,
      },
  
      include: {
        mascotas: true,
        usuarios: true,
      },
    });
  
    if (!cita) {
      throw new BadRequestException(
        'La cita no existe',
      );
    }
  
    return cita;
  }

  // UPDATE ESTADO
  async updateEstado(
    id: number,
    estado: EstadoCita,
  ) {
    return this.prisma.citas.update({
      where: {
        id_cita: id,
      },
      data: {
        estado,
      },
    });
  }

  // DELETE
  remove(id: number) {
    return this.prisma.citas.delete({
      where: {
        id_cita: id,
      },
    });
  }
}