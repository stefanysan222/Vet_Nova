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

import { ServiciosService } from './servicios.service';

import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@ApiTags('Servicios')
@ApiBearerAuth('access-token')

@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)

@Controller('servicios')

export class ServiciosController {
  constructor(
    private readonly serviciosService: ServiciosService,
  ) {}

  // CREATE
  @Post()

  @Roles(
    'ADMIN',
    'VETERINARIO',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Crear servicio veterinario',
  })

  @ApiResponse({
    status: 201,
    description: 'Servicio creado correctamente',
  })

  create(
    @Body()
    dto: CreateServicioDto,
  ) {
    return this.serviciosService.create(dto);
  }

  // GET ALL
  @Get()

  @Roles(
    'ADMIN',
    'VETERINARIO',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Obtener servicios',
  })

  @ApiResponse({
    status: 200,
    description: 'Servicios obtenidos correctamente',
  })

  findAll() {
    return this.serviciosService.findAll();
  }

  // GET ONE
  @Get(':id')

  @Roles(
    'ADMIN',
    'VETERINARIO',
    'CLIENTE',
  )

  @ApiOperation({
    summary: 'Obtener servicio por ID',
  })

  @ApiResponse({
    status: 200,
    description: 'Servicio encontrado',
  })

  findOne(
    @Param('id')
    id: string,
  ) {
    return this.serviciosService.findOne(+id);
  }

  // UPDATE
  @Patch(':id')

  @Roles(
    'ADMIN',
    'VETERINARIO',
  )

  @ApiOperation({
    summary: 'Actualizar servicio',
  })

  @ApiResponse({
    status: 200,
    description: 'Servicio actualizado correctamente',
  })

  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateServicioDto,
  ) {
    return this.serviciosService.update(+id, dto);
  }

  // DELETE
  @Delete(':id')

  @Roles('ADMIN')

  @ApiOperation({
    summary: 'Eliminar servicio',
  })

  @ApiResponse({
    status: 200,
    description: 'Servicio eliminado correctamente',
  })

  remove(
    @Param('id')
    id: string,
  ) {
    return this.serviciosService.remove(+id);
  }
}