import {
  Controller,
  Get,
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

import { UsuariosService } from './usuarios.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Usuarios')
@ApiBearerAuth('access-token')

@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)

@Controller('usuarios')
export class UsuariosController {

  constructor(
    private readonly usuariosService: UsuariosService,
  ) {}

  // GET ALL
  @Get()

  @Roles('ADMIN')

  @ApiOperation({
    summary: 'Obtener todos los usuarios',
  })

  @ApiResponse({
    status: 200,
    description: 'Usuarios obtenidos correctamente',
  })

  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })

  findAll() {
    return this.usuariosService.findAll();
  }

  // GET ONE
  @Get(':id')

  @Roles('ADMIN')

  @ApiOperation({
    summary: 'Obtener un usuario por ID',
  })

  @ApiResponse({
    status: 200,
    description: 'Usuario obtenido correctamente',
  })

  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })

  findOne(
    @Param('id') id: string,
  ) {
    return this.usuariosService.findOne(
      +id,
    );
  }

  // DELETE
  @Delete(':id')

  @Roles('ADMIN')

  @ApiOperation({
    summary: 'Eliminar usuario',
  })

  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado correctamente',
  })

  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })

  remove(
    @Param('id') id: string,
  ) {
    return this.usuariosService.remove(
      +id,
    );
  }
}