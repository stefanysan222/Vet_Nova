import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
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

import { PropietariosService } from './propietarios.service';

import { CreatePropietarioDto } from './dto/create-propietario.dto';
import { UpdatePropietarioDto } from './dto/update-propietario.dto';

@ApiTags('Propietarios')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('propietarios')

export class PropietariosController {
  constructor(
    private readonly propietariosService: PropietariosService,
  ) {}

  // CREATE
  @Post()

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Crear propietario',
  })

  @ApiResponse({
    status: 201,
    description: 'Propietario creado correctamente',
  })

  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })

  create(
    @Body()
    dto: CreatePropietarioDto,
  ) {
    return this.propietariosService.create(
      dto,
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
    summary: 'Obtener propietarios',
  })

  @ApiResponse({
    status: 200,
    description: 'Propietarios obtenidos correctamente',
  })

  findAll(
    @Query('nombre')
    nombre?: string,
  ) {
    return this.propietariosService.findAll(
      nombre,
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
    summary: 'Consultar propietario',
  })

  @ApiResponse({
    status: 200,
    description: 'Propietario encontrado',
  })

  @ApiResponse({
    status: 404,
    description: 'Propietario no encontrado',
  })

  findOne(
    @Param('id')
    id: string,
  ) {
    return this.propietariosService.findOne(
      +id,
    );
  }

  // UPDATE
  @Put(':id')

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Actualizar propietario',
  })

  @ApiResponse({
    status: 200,
    description: 'Propietario actualizado correctamente',
  })

  @ApiResponse({
    status: 404,
    description: 'Propietario no encontrado',
  })

  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdatePropietarioDto,
  ) {
    return this.propietariosService.update(
      +id,
      dto,
    );
  }

  // DELETE
  @Delete(':id')

  @Roles('ADMIN')

  @ApiOperation({
    summary: 'Eliminar propietario',
  })

  @ApiResponse({
    status: 200,
    description: 'Propietario eliminado correctamente',
  })

  @ApiResponse({
    status: 404,
    description: 'Propietario no encontrado',
  })

  remove(
    @Param('id')
    id: string,
  ) {
    return this.propietariosService.remove(
      +id,
    );
  }
}