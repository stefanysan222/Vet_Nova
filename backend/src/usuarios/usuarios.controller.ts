import {
    Controller,
    Get,
    Param,
    Delete,
    UseGuards,
  } from '@nestjs/common';
  
  import { ApiBearerAuth } from '@nestjs/swagger';
  
  import { UsuariosService } from './usuarios.service';
  
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  
  import { RolesGuard } from '../auth/guards/roles.guard';
  
  import { Roles } from '../auth/decorators/roles.decorator';
  import { ApiOperation } from '@nestjs/swagger';
  import { ApiResponse } from '@nestjs/swagger';
  @ApiBearerAuth()
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  
  @Controller('usuarios')
  export class UsuariosController {
    constructor(
      private readonly usuariosService: UsuariosService,
    ) {}
  
    @Get()
  
    @Roles('ADMIN')
    @ApiOperation({
      summary: 'obtener todos los usuarios',
    })
  
    @ApiResponse({
      status: 200,
      description: 'Usuarios obtenidos correctamente',
    })
  
    @ApiResponse({
      status: 401,
      description: 'No autorizado',
    })
  
    @ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    })
  
    findAll() {
      return this.usuariosService.findAll();
    }
  
    @Get(':id')
  
    @Roles('ADMIN')
    @ApiOperation({
      summary: 'obtener un usuario',
    })
  
    @ApiResponse({
      status: 200,
      description: 'Usuario obtenido correctamente',
    })
  
    @ApiResponse({
      status: 401,
      description: 'No autorizado',
    })
  
    @ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    })
    findOne(@Param('id') id: string) {
      return this.usuariosService.findOne(+id);
    }
  
    @Delete(':id')
  
    @Roles('ADMIN')
    @ApiOperation({
      summary: 'eliminar un usuario',
    })
  
    @ApiResponse({
      status: 200,
      description: 'Usuario eliminado correctamente',
    })
  
    @ApiResponse({
      status: 401,
      description: 'No autorizado',
    })
  
    @ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    })
  
    remove(@Param('id') id: string) {
      return this.usuariosService.remove(+id);
    }
  }