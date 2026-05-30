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

import { HistoriasClinicasService } from './historias-clinicas.service';

import { CreateHistoriasClinicaDto } from './dto/create-historias-clinica.dto';
import { UpdateHistoriasClinicaDto } from './dto/update-historias-clinica.dto';

@ApiTags('Historias Clínicas')
@ApiBearerAuth('access-token')

@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)

@Controller('historias-clinicas')

export class HistoriasClinicasController {
  constructor(
    private readonly historiasClinicasService: HistoriasClinicasService,
  ) {}

  // CREATE
  @Post()

  @Roles(
    'ADMIN',
    'VETERINARIO',
  )

  @ApiOperation({
    summary: 'Crear historia clínica',
  })

  @ApiResponse({
    status: 201,
    description: 'Historia clínica creada correctamente',
  })

  create(
    @Body()
    createHistoriasClinicaDto: CreateHistoriasClinicaDto,
  ) {
    return this.historiasClinicasService.create(
      createHistoriasClinicaDto,
    );
  }

  // GET ALL
  @Get()

  @Roles(
    'ADMIN',
    'VETERINARIO',
  )

  @ApiOperation({
    summary: 'Obtener historias clínicas',
  })

  @ApiResponse({
    status: 200,
    description: 'Historias clínicas obtenidas correctamente',
  })

  findAll() {
    return this.historiasClinicasService.findAll();
  }

  // GET ONE
  @Get(':id')

  @Roles(
    'ADMIN',
    'VETERINARIO',
    'CLIENTE',
  )

  @ApiOperation({
    summary: 'Obtener historia clínica por ID',
  })

  @ApiResponse({
    status: 200,
    description: 'Historia clínica encontrada',
  })

  findOne(
    @Param('id')
    id: string,
  ) {
    return this.historiasClinicasService.findOne(+id);
  }

  // UPDATE
  @Patch(':id')

  @Roles(
    'ADMIN',
    'VETERINARIO',
  )

  @ApiOperation({
    summary: 'Actualizar historia clínica',
  })

  @ApiResponse({
    status: 200,
    description: 'Historia clínica actualizada correctamente',
  })

  update(
    @Param('id')
    id: string,

    @Body()
    updateHistoriasClinicaDto: UpdateHistoriasClinicaDto,
  ) {
    return this.historiasClinicasService.update(
      +id,
      updateHistoriasClinicaDto,
    );
  }

  // DELETE
  @Delete(':id')

  @Roles('ADMIN')

  @ApiOperation({
    summary: 'Eliminar historia clínica',
  })

  @ApiResponse({
    status: 200,
    description: 'Historia clínica eliminada correctamente',
  })

  remove(
    @Param('id')
    id: string,
  ) {
    return this.historiasClinicasService.remove(+id);
  }
}