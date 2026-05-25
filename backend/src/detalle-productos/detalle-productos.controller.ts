import {
  Controller,
  Get,
  Post,
  Body,
 Patch,
  Param,
 Delete,
} from '@nestjs/common';

import { DetalleProductosService } from './detalle-productos.service';

import { CreateDetalleProductoDto } from './dto/create-detalle-producto.dto';
import { UpdateDetalleProductoDto } from './dto/update-detalle-producto.dto';

@Controller('detalle-productos')
export class DetalleProductosController {
  constructor(
    private readonly detalleProductosService: DetalleProductosService,
  ) {}

  @Post()
  create(
    @Body()
    createDetalleProductoDto: CreateDetalleProductoDto,
  ) {
    return this.detalleProductosService.create(
      createDetalleProductoDto,
    );
  }

  @Get()
  findAll() {
    return this.detalleProductosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detalleProductosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateDetalleProductoDto: UpdateDetalleProductoDto,
  ) {
    return this.detalleProductosService.update(
      +id,
      updateDetalleProductoDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detalleProductosService.remove(+id);
  }
}