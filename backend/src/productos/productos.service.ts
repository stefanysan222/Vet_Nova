import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateProductoDto) {
    return this.prisma.productos.create({
      data: {
        nombre: dto.nombre,
        tipo: dto.tipo,
        precio: dto.precio,
        stock: dto.stock,
      },
    });
  }

  findAll() {
    return this.prisma.productos.findMany();
  }

  async findOne(id: number) {
    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: id },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }

  async update(id: number, dto: UpdateProductoDto) {
    await this.findOne(id);

    return this.prisma.productos.update({
      where: { id_producto: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.productos.delete({
      where: { id_producto: id },
    });
  }
}