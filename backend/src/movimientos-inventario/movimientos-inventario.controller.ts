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

import { MovimientosInventarioService } from './movimientos-inventario.service';

import { CreateMovimientosInventarioDto } from './dto/create-movimientos-inventario.dto';
import { UpdateMovimientosInventarioDto } from './dto/update-movimientos-inventario.dto';

@ApiTags('Movimientos Inventario')
@ApiBearerAuth('access-token')

@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)

@Controller('movimientos-inventario')

export class MovimientosInventarioController {
  constructor(
    private readonly movimientosInventarioService: MovimientosInventarioService,
  ) {}

  // CREATE
  @Post()

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Registrar movimiento de inventario',
  })

  @ApiResponse({
    status: 201,
    description: 'Movimiento registrado correctamente',
  })

  create(
    @Body()
    createMovimientosInventarioDto: CreateMovimientosInventarioDto,
  ) {
    return this.movimientosInventarioService.create(
      createMovimientosInventarioDto,
    );
  }

  // GET ALL
  @Get()

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Obtener movimientos de inventario',
  })

  @ApiResponse({
    status: 200,
    description: 'Movimientos obtenidos correctamente',
  })

  findAll() {
    return this.movimientosInventarioService.findAll();
  }

  // GET ONE
  @Get(':id')

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Obtener movimiento de inventario por ID',
  })

  @ApiResponse({
    status: 200,
    description: 'Movimiento encontrado',
  })

  findOne(
    @Param('id')
    id: string,
  ) {
    return this.movimientosInventarioService.findOne(+id);
  }

  // UPDATE
  @Patch(':id')

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Actualizar movimiento de inventario',
  })

  @ApiResponse({
    status: 200,
    description: 'Movimiento actualizado correctamente',
  })

  update(
    @Param('id')
    id: string,

    @Body()
    updateMovimientosInventarioDto: UpdateMovimientosInventarioDto,
  ) {
    return this.movimientosInventarioService.update(
      +id,
      updateMovimientosInventarioDto,
    );
  }

  // DELETE
  @Delete(':id')

  @Roles('ADMIN')

  @ApiOperation({
    summary: 'Eliminar movimiento de inventario',
  })

  @ApiResponse({
    status: 200,
    description: 'Movimiento eliminado correctamente',
  })

  remove(
    @Param('id')
    id: string,
  ) {
    return this.movimientosInventarioService.remove(+id);
  }
}