import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacturasDto } from './dto/create-facturas.dto';
import { UpdateFacturasDto } from './dto/update-facturas.dto';

@Injectable()
export class FacturasService {
  constructor(private prisma: PrismaService) {}

  // CREATE
  create(dto: CreateFacturasDto) {
    return this.prisma.facturas.create({
      data: dto,
    });
  }

  // GET ALL
  findAll() {
    return this.prisma.facturas.findMany({
      include: {
        propietarios: true,
        mascotas: true,
      },
    });
  }

  // GET ONE
  findOne(id: number) {
    return this.prisma.facturas.findUnique({
      where: {
        id_factura: id,
      },
      include: {
        propietarios: true,
        mascotas: true,
      },
    });
  }

  // UPDATE
  update(id: number, dto: UpdateFacturasDto) {
    return this.prisma.facturas.update({
      where: {
        id_factura: id,
      },
      data: dto,
    });
  }

  // DELETE
  remove(id: number) {
    return this.prisma.facturas.delete({
      where: {
        id_factura: id,
      },
    });
  }
}