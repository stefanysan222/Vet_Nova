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

import { ProductosService } from './productos.service';

import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@ApiTags('Productos')
@ApiBearerAuth('access-token')

@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)

@Controller('productos')

export class ProductosController {
  constructor(
    private readonly productosService: ProductosService,
  ) {}

  // CREATE
  @Post()

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Crear producto',
  })

  @ApiResponse({
    status: 201,
    description: 'Producto creado correctamente',
  })

  create(
    @Body()
    dto: CreateProductoDto,
  ) {
    return this.productosService.create(dto);
  }

  // GET ALL
  @Get()

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
    'VETERINARIO',
  )

  @ApiOperation({
    summary: 'Obtener productos',
  })

  @ApiResponse({
    status: 200,
    description: 'Productos obtenidos correctamente',
  })

  findAll() {
    return this.productosService.findAll();
  }

  // GET ONE
  @Get(':id')

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
    'VETERINARIO',
  )

  @ApiOperation({
    summary: 'Obtener producto por ID',
  })

  @ApiResponse({
    status: 200,
    description: 'Producto encontrado',
  })

  findOne(
    @Param('id')
    id: string,
  ) {
    return this.productosService.findOne(+id);
  }

  // UPDATE
  @Patch(':id')

  @Roles(
    'ADMIN',
    'RECEPCIONISTA',
  )

  @ApiOperation({
    summary: 'Actualizar producto',
  })

  @ApiResponse({
    status: 200,
    description: 'Producto actualizado correctamente',
  })

  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateProductoDto,
  ) {
    return this.productosService.update(+id, dto);
  }

  // DELETE
  @Delete(':id')

  @Roles('ADMIN')

  @ApiOperation({
    summary: 'Eliminar producto',
  })

  @ApiResponse({
    status: 200,
    description: 'Producto eliminado correctamente',
  })

  remove(
    @Param('id')
    id: string,
  ) {
    return this.productosService.remove(+id);
  }
}