import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateMovimientosInventarioDto } from './dto/create-movimientos-inventario.dto';
import { UpdateMovimientosInventarioDto } from './dto/update-movimientos-inventario.dto';

@Injectable()
export class MovimientosInventarioService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMovimientosInventarioDto) {
    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: dto.id_producto },
    });

    if (!producto) {
      throw new BadRequestException('El producto no existe');
    }

    if (dto.tipo === 'salida' && producto.stock < dto.cantidad) {
      throw new BadRequestException(
        'Stock insuficiente',
      );
    }

    const nuevoStock =
      dto.tipo === 'entrada'
        ? producto.stock + dto.cantidad
        : producto.stock - dto.cantidad;

    await this.prisma.productos.update({
      where: { id_producto: dto.id_producto },
      data: {
        stock: nuevoStock,
      },
    });

    return this.prisma.movimientos_inventario.create({
      data: {
        tipo: dto.tipo,
        cantidad: dto.cantidad,
        id_producto: dto.id_producto,
      },
      include: {
        productos: true,
      },
    });
  }

  async findAll() {
    return this.prisma.movimientos_inventario.findMany({
      include: {
        productos: true,
      },
    });
  }

  async findOne(id: number) {
    const movimiento =
      await this.prisma.movimientos_inventario.findUnique({
        where: { id_movimiento: id },
        include: {
          productos: true,
        },
      });

    if (!movimiento) {
      throw new NotFoundException(
        'Movimiento no encontrado',
      );
    }

    return movimiento;
  }

  async update(
    id: number,
    dto: UpdateMovimientosInventarioDto,
  ) {
    await this.findOne(id);

    return this.prisma.movimientos_inventario.update({
      where: { id_movimiento: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.movimientos_inventario.delete({
      where: { id_movimiento: id },
    });
  }
}