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
  
  @ApiBearerAuth()
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  
  @Controller('usuarios')
  export class UsuariosController {
    constructor(
      private readonly usuariosService: UsuariosService,
    ) {}
  
    @Get()
  
    @Roles('ADMIN')
  
    findAll() {
      return this.usuariosService.findAll();
    }
  
    @Get(':id')
  
    @Roles('ADMIN')
  
    findOne(@Param('id') id: string) {
      return this.usuariosService.findOne(+id);
    }
  
    @Delete(':id')
  
    @Roles('ADMIN')
  
    remove(@Param('id') id: string) {
      return this.usuariosService.remove(+id);
    }
  }