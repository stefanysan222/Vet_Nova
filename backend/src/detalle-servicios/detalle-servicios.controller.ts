import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { DetalleServiciosService } from './detalle-servicios.service';

import { CreateDetalleServicioDto } from './dto/create-detalle-servicio.dto';
import { UpdateDetalleServicioDto } from './dto/update-detalle-servicio.dto';

@Controller('detalle-servicios')
export class DetalleServiciosController {
  constructor(
    private readonly detalleServiciosService: DetalleServiciosService,
  ) {}

  @Post()
  create(
    @Body()
    createDetalleServicioDto: CreateDetalleServicioDto,
  ) {
    return this.detalleServiciosService.create(
      createDetalleServicioDto,
    );
  }

  @Get()
  findAll() {
    return this.detalleServiciosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detalleServiciosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateDetalleServicioDto: UpdateDetalleServicioDto,
  ) {
    return this.detalleServiciosService.update(
      +id,
      updateDetalleServicioDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detalleServiciosService.remove(+id);
  }
}