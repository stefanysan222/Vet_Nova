import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateDetalleServicioDto } from './dto/create-detalle-servicio.dto';
import { UpdateDetalleServicioDto } from './dto/update-detalle-servicio.dto';

@Injectable()
export class DetalleServiciosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDetalleServicioDto) {
    const factura = await this.prisma.facturas.findUnique({
      where: { id_factura: dto.id_factura },
    });

    if (!factura) {
      throw new BadRequestException(
        'La factura no existe',
      );
    }

    const servicio = await this.prisma.servicios.findUnique({
      where: { id_servicio: dto.id_servicio },
    });

    if (!servicio) {
      throw new BadRequestException(
        'El servicio no existe',
      );
    }

    return this.prisma.detalle_servicios.create({
      data: {
        id_factura: dto.id_factura,
        id_servicio: dto.id_servicio,
        cantidad: dto.cantidad,
        precio_unitario: dto.precio_unitario,
      },
      include: {
        facturas: true,
        servicios: true,
      },
    });
  }

  async findAll() {
    return this.prisma.detalle_servicios.findMany({
      include: {
        facturas: true,
        servicios: true,
      },
    });
  }

  async findOne(id: number) {
    const detalle =
      await this.prisma.detalle_servicios.findUnique({
        where: { id_detalle: id },
        include: {
          facturas: true,
          servicios: true,
        },
      });

    if (!detalle) {
      throw new NotFoundException(
        'Detalle de servicio no encontrado',
      );
    }

    return detalle;
  }

  async update(
    id: number,
    dto: UpdateDetalleServicioDto,
  ) {
    await this.findOne(id);

    return this.prisma.detalle_servicios.update({
      where: { id_detalle: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.detalle_servicios.delete({
      where: { id_detalle: id },
    });
  }
}
