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

import { ConsultasService } from './consultas.service';

import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';

@ApiTags('Consultas')
@ApiBearerAuth('access-token')

@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)

@Controller('consultas')

export class ConsultasController {
  constructor(
    private readonly consultasService: ConsultasService,
  ) {}

  // CREATE
  @Post()

  @Roles(
    'ADMIN',
    'VETERINARIO',
  )

  @ApiOperation({
    summary: 'Registrar consulta veterinaria',
  })

  @ApiResponse({
    status: 201,
    description: 'Consulta creada correctamente',
  })

  create(
    @Body()
    dto: CreateConsultaDto,
  ) {
    return this.consultasService.create(dto);
  }

  // GET ALL
  @Get()

  @Roles(
    'ADMIN',
    'VETERINARIO',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Obtener consultas',
  })

  @ApiResponse({
    status: 200,
    description: 'Consultas obtenidas correctamente',
  })

  findAll() {
    return this.consultasService.findAll();
  }

  // GET ONE
  @Get(':id')

  @Roles(
    'ADMIN',
    'VETERINARIO',
    'CLIENTE',
  )

  @ApiOperation({
    summary: 'Obtener consulta por ID',
  })

  @ApiResponse({
    status: 200,
    description: 'Consulta encontrada',
  })

  findOne(
    @Param('id')
    id: string,
  ) {
    return this.consultasService.findOne(+id);
  }

  // UPDATE
  @Patch(':id')

  @Roles(
    'ADMIN',
    'VETERINARIO',
  )

  @ApiOperation({
    summary: 'Actualizar consulta',
  })

  @ApiResponse({
    status: 200,
    description: 'Consulta actualizada correctamente',
  })

  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateConsultaDto,
  ) {
    return this.consultasService.update(+id, dto);
  }

  // DELETE
  @Delete(':id')

  @Roles('ADMIN')

  @ApiOperation({
    summary: 'Eliminar consulta',
  })

  @ApiResponse({
    status: 200,
    description: 'Consulta eliminada correctamente',
  })

  remove(
    @Param('id')
    id: string,
  ) {
    return this.consultasService.remove(+id);
  }
}