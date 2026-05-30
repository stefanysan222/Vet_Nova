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

import { DetalleServiciosService } from './detalle-servicios.service';

import { CreateDetalleServicioDto } from './dto/create-detalle-servicio.dto';
import { UpdateDetalleServicioDto } from './dto/update-detalle-servicio.dto';

@ApiTags('Detalle Servicios')
@ApiBearerAuth('access-token')

@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)

@Controller('detalle-servicios')

export class DetalleServiciosController {
  constructor(
    private readonly detalleServiciosService: DetalleServiciosService,
  ) {}

  // CREATE
  @Post()

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Agregar servicio a factura',
  })

  @ApiResponse({
    status: 201,
    description: 'Detalle de servicio creado correctamente',
  })

  create(
    @Body()
    createDetalleServicioDto: CreateDetalleServicioDto,
  ) {
    return this.detalleServiciosService.create(
      createDetalleServicioDto,
    );
  }

  // GET ALL
  @Get()

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Obtener detalles de servicios',
  })

  @ApiResponse({
    status: 200,
    description: 'Detalles obtenidos correctamente',
  })

  findAll() {
    return this.detalleServiciosService.findAll();
  }

  // GET ONE
  @Get(':id')

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Obtener detalle de servicio por ID',
  })

  @ApiResponse({
    status: 200,
    description: 'Detalle encontrado',
  })

  findOne(
    @Param('id')
    id: string,
  ) {
    return this.detalleServiciosService.findOne(+id);
  }

  // UPDATE
  @Patch(':id')

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Actualizar detalle de servicio',
  })

  @ApiResponse({
    status: 200,
    description: 'Detalle actualizado correctamente',
  })

  update(
    @Param('id')
    id: string,

    @Body()
    updateDetalleServicioDto: UpdateDetalleServicioDto,
  ) {
    return this.detalleServiciosService.update(
      +id,
      updateDetalleServicioDto,
    );
  }

  // DELETE
  @Delete(':id')

  @Roles('ADMIN')

  @ApiOperation({
    summary: 'Eliminar detalle de servicio',
  })

  @ApiResponse({
    status: 200,
    description: 'Detalle eliminado correctamente',
  })

  remove(
    @Param('id')
    id: string,
  ) {
    return this.detalleServiciosService.remove(+id);
  }
}