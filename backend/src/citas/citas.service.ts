import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // ✅ CORREGIDO
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';

@Injectable()
export class CitasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCitaDto) {

    // 🔥 VALIDAR SI YA EXISTE UNA CITA
    const existe = await this.prisma.citas.findFirst({
      where: {
        fecha: new Date(dto.fecha),
        hora: dto.hora,
      },
    });
  
    if (existe) {
      throw new BadRequestException('Ya existe una cita en ese horario');
    }
  
    const mascota = await this.prisma.mascotas.findUnique({
      where: { id_mascota: dto.id_mascota },
    });
  
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id_usuario: dto.id_usuario },
    });
  
    if (!mascota) {
      throw new BadRequestException('La mascota no existe');
    }
  
    if (!usuario) {
      throw new BadRequestException('El usuario no existe');
    }
  
    return this.prisma.citas.create({
      data: {
        fecha: new Date(dto.fecha),
        hora: dto.hora,
        estado: dto.estado ?? 'pendiente',
        id_mascota: dto.id_mascota,
        id_usuario: dto.id_usuario,
      },
    });
  }

  // GET ALL
  findAll() {
    return this.prisma.citas.findMany({
      include: {
        mascotas: true,
        usuarios: true,
      },
    });
  }

  // GET ONE
  findOne(id: number) {
    return this.prisma.citas.findUnique({
      where: { id_cita: id },
      include: {
        mascotas: true,
        usuarios: true,
      },
    });
  }

  // UPDATE
  update(id: number, dto: UpdateCitaDto) {
    return this.prisma.citas.update({
      where: { id_cita: id },
      data: {
        ...dto,
        fecha: dto.fecha ? new Date(dto.fecha) : undefined, // 🔥 importante
      },
    });
  }

  // DELETE
  remove(id: number) {
    return this.prisma.citas.delete({
      where: { id_cita: id },
    });
  }
}