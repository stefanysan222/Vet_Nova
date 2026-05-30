import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';

import { DetalleProductosService } from './detalle-productos.service';

import { CreateDetalleProductoDto } from './dto/create-detalle-producto.dto';
import { UpdateDetalleProductoDto } from './dto/update-detalle-producto.dto';

@ApiTags('Detalle Productos')
@ApiBearerAuth('access-token')

@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)

@Controller('detalle-productos')

export class DetalleProductosController {
  constructor(
    private readonly detalleProductosService: DetalleProductosService,
  ) {}

  // CREATE
  @Post()

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Agregar producto a factura',
  })

  @ApiResponse({
    status: 201,
    description: 'Detalle de producto creado correctamente',
  })

  create(
    @Body()
    createDetalleProductoDto: CreateDetalleProductoDto,
  ) {
    return this.detalleProductosService.create(
      createDetalleProductoDto,
    );
  }

  // GET ALL
  @Get()

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Obtener detalles de productos',
  })

  @ApiResponse({
    status: 200,
    description: 'Detalles obtenidos correctamente',
  })

  findAll() {
    return this.detalleProductosService.findAll();
  }

  // GET ONE
  @Get(':id')

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Obtener detalle de producto por ID',
  })

  @ApiResponse({
    status: 200,
    description: 'Detalle encontrado',
  })

  findOne(
    @Param('id')
    id: string,
  ) {
    return this.detalleProductosService.findOne(+id);
  }

  // UPDATE
  @Patch(':id')

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Actualizar detalle de producto',
  })

  @ApiResponse({
    status: 200,
    description: 'Detalle actualizado correctamente',
  })

  update(
    @Param('id')
    id: string,

    @Body()
    updateDetalleProductoDto: UpdateDetalleProductoDto,
  ) {
    return this.detalleProductosService.update(
      +id,
      updateDetalleProductoDto,
    );
  }

  // DELETE
  @Delete(':id')

  @Roles('ADMIN')

  @ApiOperation({
    summary: 'Eliminar detalle de producto',
  })

  @ApiResponse({
    status: 200,
    description: 'Detalle eliminado correctamente',
  })

  remove(
    @Param('id')
    id: string,
  ) {
    return this.detalleProductosService.remove(+id);
  }
}