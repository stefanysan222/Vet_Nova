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
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PropietariosService } from './propietarios.service';
import { CreatePropietarioDto } from './dto/create-propietario.dto';
import { UpdatePropietarioDto } from './dto/update-propietario.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiResponse,
} from '@nestjs/swagger';


@ApiBearerAuth('access-token')

@UseGuards(JwtAuthGuard, RolesGuard)

@Controller('propietarios')

export class PropietariosController {
  constructor(
    private readonly propietariosService: PropietariosService,
  ) {}

  @Post()

  @Roles('ADMIN', 'RECEPCIONISTA')
  @ApiOperation({
    summary: 'Crear nuevo propietario',
  })

  @ApiResponse({
    status: 201,
    description: 'Propietario creado',
  })

  @ApiResponse({
    status: 400,
    description: 'Propietario no creado',
  })


  create(
    @Body() createPropietarioDto: CreatePropietarioDto,
  ) {
    return this.propietariosService.create(
      createPropietarioDto,
    );
  }

  
  @Get()

  @Roles(
    'ADMIN',
    'VETERINARIO',
    'RECEPCIONISTA',
  )
  @ApiOperation({
    summary: 'Obtener todos los propietarios',
  })
  @ApiResponse({
    status: 200,
    description: 'Propietarios obtenidos',
  })
  @ApiResponse({
    status: 400,
    description: 'Propietarios no obtenidos',
  })

  findAll(@Query('nombre') nombre?: string) {
    return this.propietariosService.findAll(nombre);
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
    description: 'Propietario obtenido',
  })
  @ApiResponse({
    status: 400,
    description: 'Propietario no obtenido',
  })

  findOne(@Param('id') id: string) {
    return this.propietariosService.findOne(+id);
  }

  // UPDATE
  @Put(':id')

  @Roles('ADMIN', 'RECEPCIONISTA')

  @ApiOperation({
    summary: 'Actualizar propietario',
  })

  @ApiResponse({
    status: 200,
    description: 'Propietario actualizado',
  })
  @ApiResponse({
    status: 400,
    description: 'Propietario no actualizado',
  })

  update(
    @Param('id') id: string,
    @Body() updatePropietarioDto: UpdatePropietarioDto,
  ) {
    return this.propietariosService.update(
      +id,
      updatePropietarioDto,
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
    description: 'Propietario eliminado',
  })
  @ApiResponse({
    status: 400,
    description: 'Propietario no eliminado',
  })

  remove(@Param('id') id: string) {
    return this.propietariosService.remove(+id);
  }
}