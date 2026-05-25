import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { MovimientosInventarioService } from './movimientos-inventario.service';

import { CreateMovimientosInventarioDto } from './dto/create-movimientos-inventario.dto';
import { UpdateMovimientosInventarioDto } from './dto/update-movimientos-inventario.dto';

@Controller('movimientos-inventario')
export class MovimientosInventarioController {
  constructor(
    private readonly movimientosInventarioService: MovimientosInventarioService,
  ) {}

  @Post()
  create(
    @Body()
    createMovimientosInventarioDto: CreateMovimientosInventarioDto,
  ) {
    return this.movimientosInventarioService.create(
      createMovimientosInventarioDto,
    );
  }

  @Get()
  findAll() {
    return this.movimientosInventarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movimientosInventarioService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateMovimientosInventarioDto: UpdateMovimientosInventarioDto,
  ) {
    return this.movimientosInventarioService.update(
      +id,
      updateMovimientosInventarioDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movimientosInventarioService.remove(+id);
  }
}