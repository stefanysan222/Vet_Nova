import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';

import { FacturasService } from './facturas.service';
import { CreateFacturasDto } from './dto/create-facturas.dto';
import { UpdateFacturasDto } from './dto/update-facturas.dto';

@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  // CREATE
  @Post()
  create(@Body() dto: CreateFacturasDto) {
    return this.facturasService.create(dto);
  }

  // GET ALL
  @Get()
  findAll() {
    return this.facturasService.findAll();
  }

  // GET ONE
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facturasService.findOne(+id);
  }

  // UPDATE
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFacturasDto,
  ) {
    return this.facturasService.update(+id, dto);
  }

  // DELETE
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facturasService.remove(+id);
  }
}