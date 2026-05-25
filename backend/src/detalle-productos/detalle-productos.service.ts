import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateDetalleProductoDto } from './dto/create-detalle-producto.dto';
import { UpdateDetalleProductoDto } from './dto/update-detalle-producto.dto';

@Injectable()
export class DetalleProductosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDetalleProductoDto) {
    const factura = await this.prisma.facturas.findUnique({
      where: { id_factura: dto.id_factura },
    });

    if (!factura) {
      throw new BadRequestException(
        'La factura no existe',
      );
    }

    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: dto.id_producto },
    });

    if (!producto) {
      throw new BadRequestException(
        'El producto no existe',
      );
    }

    if (producto.stock < dto.cantidad) {
      throw new BadRequestException(
        'Stock insuficiente',
      );
    }

    const nuevoStock =
      producto.stock - dto.cantidad;

    await this.prisma.productos.update({
      where: { id_producto: dto.id_producto },
      data: {
        stock: nuevoStock,
      },
    });

    return this.prisma.detalle_productos.create({
      data: {
        id_factura: dto.id_factura,
        id_producto: dto.id_producto,
        cantidad: dto.cantidad,
        precio_unitario: dto.precio_unitario,
      },
      include: {
        facturas: true,
        productos: true,
      },
    });
  }

  async findAll() {
    return this.prisma.detalle_productos.findMany({
      include: {
        facturas: true,
        productos: true,
      },
    });
  }

  async findOne(id: number) {
    const detalle =
      await this.prisma.detalle_productos.findUnique({
        where: { id_detalle: id },
        include: {
          facturas: true,
          productos: true,
        },
      });

    if (!detalle) {
      throw new NotFoundException(
        'Detalle de producto no encontrado',
      );
    }

    return detalle;
  }

  async update(
    id: number,
    dto: UpdateDetalleProductoDto,
  ) {
    await this.findOne(id);

    return this.prisma.detalle_productos.update({
      where: { id_detalle: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.detalle_productos.delete({
      where: { id_detalle: id },
    });
  }
}
