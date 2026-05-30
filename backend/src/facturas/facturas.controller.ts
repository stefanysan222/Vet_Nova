import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { FacturasService } from './facturas.service';
import { CreateFacturasDto } from './dto/create-facturas.dto';
import { UpdateFacturasDto } from './dto/update-facturas.dto';

@ApiTags('Facturas')
@ApiBearerAuth()
@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  // CREATE
  @Post()
  @ApiOperation({ summary: 'Crear factura' })
  @ApiResponse({
    status: 201,
    description: 'Factura creada correctamente',
  })
  create(@Body() dto: CreateFacturasDto) {
    return this.facturasService.create(dto);
  }

  // GET ALL
  @Get()
  @ApiOperation({ summary: 'Obtener facturas' })
  findAll() {
    return this.facturasService.findAll();
  }

  // GET ONE
  @Get(':id')
  @ApiOperation({ summary: 'Obtener factura por ID' })
  findOne(@Param('id') id: string) {
    return this.facturasService.findOne(+id);
  }

  // UPDATE
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar factura' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFacturasDto,
  ) {
    return this.facturasService.update(+id, dto);
  }

  // DELETE
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar factura' })
  remove(@Param('id') id: string) {
    return this.facturasService.remove(+id);
  }
}