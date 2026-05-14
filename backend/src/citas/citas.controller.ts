import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';

import { CitasService } from './citas.service';

import { CreateCitaDto } from './dto/create-cita.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';

import { EstadoCita } from '@prisma/client';
import { UpdateEstadoDto } from './dto/update-estado.dto';

import { ApiOperation } from '@nestjs/swagger';
import {
  ApiResponse,
} from '@nestjs/swagger';

@ApiBearerAuth('access-token')

@UseGuards(JwtAuthGuard, RolesGuard)

@Controller('citas')
export class CitasController {
  constructor(
    private readonly citasService: CitasService,
  ) {}

  // CREATE
  @Post()

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
  )
  @ApiOperation({
    summary: 'Crear una cita',
  })
  @ApiResponse({
    status: 201,
    description: 'Cita creada correctamente',
  })

  @ApiResponse({
    status: 400,
    description: 'Horario ocupado',
  })

  create(@Body() dto: CreateCitaDto) {
    return this.citasService.create(dto);
  }

  // GET ALL
  @Get()

  @Roles(
    'ADMIN',
    'VETERINARIO',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'obtener todas las citas',
  })
  @ApiResponse({
    status: 200,
    description: 'Citas obtenidas correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron citas',
  })

  findAll(
    @Query('estado') estado?: EstadoCita,
  ) {
    return this.citasService.findAll(
      estado,
    );
  }

  // GET ONE
  @Get(':id')

  @Roles(
    'ADMIN',
    'VETERINARIO',
    'RECEPCIONISTA',
    'CLIENTE',
  )
  @ApiOperation({
    summary: 'obtener una cita',
  })
  @ApiResponse({
    status: 200,
    description: 'Cita obtenida correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cita no encontrada',
  })

  findOne(@Param('id') id: string) {
    return this.citasService.findOne(+id);
  }

  // UPDATE ESTADO
  @Patch(':id/estado')

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
    'VETERINARIO',
  )

  @Patch(':id/estado')

  @ApiOperation({
    summary: 'actualizar el estado de la cita',
  })

  @ApiResponse({
    status: 200,
    description: 'Cita actualizada correctamente',
  })

  @ApiResponse({
    status: 404,
    description: 'Cita no encontrada',
  })

  @ApiResponse({
    status: 400,
    description: 'Estado no válido',
  })


  updateEstado(
    @Param('id') id: string,
  
    @Body() dto: UpdateEstadoDto,
  ) {
    return this.citasService.updateEstado(
      +id,
      dto.estado,
    );
  }

  // DELETE
  @Delete(':id')

  @Roles('ADMIN')

  @ApiOperation({
    summary: 'Eliminar una cita',
  })

  @ApiResponse({
    status: 200,
    description: 'Cita eliminada correctamente',
  })

  @ApiResponse({
    status: 404,
    description: 'Cita no encontrada',
  })
  

  remove(@Param('id') id: string) {
    return this.citasService.remove(+id);
  }
}