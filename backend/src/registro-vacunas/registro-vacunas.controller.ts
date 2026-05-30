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

import { RegistroVacunasService } from './registro-vacunas.service';

import { CreateRegistroVacunaDto } from './dto/create-registro-vacuna.dto';
import { UpdateRegistroVacunaDto } from './dto/update-registro-vacuna.dto';

@ApiTags('Registro Vacunas')
@ApiBearerAuth('access-token')

@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)

@Controller('registro-vacunas')

export class RegistroVacunasController {
  constructor(
    private readonly registroVacunasService: RegistroVacunasService,
  ) {}

  // CREATE
  @Post()

  @Roles(
    'ADMIN',
    'VETERINARIO',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Registrar vacuna aplicada',
  })

  @ApiResponse({
    status: 201,
    description: 'Vacuna registrada correctamente',
  })

  create(
    @Body()
    createRegistroVacunaDto: CreateRegistroVacunaDto,
  ) {
    return this.registroVacunasService.create(
      createRegistroVacunaDto,
    );
  }

  // GET ALL
  @Get()

  @Roles(
    'ADMIN',
    'VETERINARIO',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Obtener registros de vacunas',
  })

  @ApiResponse({
    status: 200,
    description: 'Registros obtenidos correctamente',
  })

  findAll() {
    return this.registroVacunasService.findAll();
  }

  // GET ONE
  @Get(':id')

  @Roles(
    'ADMIN',
    'VETERINARIO',
    'CLIENTE',
  )

  @ApiOperation({
    summary: 'Obtener registro de vacuna por ID',
  })

  @ApiResponse({
    status: 200,
    description: 'Registro encontrado',
  })

  findOne(
    @Param('id')
    id: string,
  ) {
    return this.registroVacunasService.findOne(+id);
  }

  // UPDATE
  @Patch(':id')

  @Roles(
    'ADMIN',
    'VETERINARIO',
  )

  @ApiOperation({
    summary: 'Actualizar registro de vacuna',
  })

  @ApiResponse({
    status: 200,
    description: 'Registro actualizado correctamente',
  })

  update(
    @Param('id')
    id: string,

    @Body()
    updateRegistroVacunaDto: UpdateRegistroVacunaDto,
  ) {
    return this.registroVacunasService.update(
      +id,
      updateRegistroVacunaDto,
    );
  }

  // DELETE
  @Delete(':id')

  @Roles('ADMIN')

  @ApiOperation({
    summary: 'Eliminar registro de vacuna',
  })

  @ApiResponse({
    status: 200,
    description: 'Registro eliminado correctamente',
  })

  remove(
    @Param('id')
    id: string,
  ) {
    return this.registroVacunasService.remove(+id);
  }
}