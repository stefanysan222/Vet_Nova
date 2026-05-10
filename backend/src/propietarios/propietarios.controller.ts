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

@ApiBearerAuth('access-token')

@UseGuards(JwtAuthGuard, RolesGuard)

@Controller('propietarios')

export class PropietariosController {
  constructor(
    private readonly propietariosService: PropietariosService,
  ) {}

  @Post()

  @Roles('ADMIN', 'RECEPCIONISTA')

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

  findOne(@Param('id') id: string) {
    return this.propietariosService.findOne(+id);
  }

  // UPDATE
  @Put(':id')

  @Roles('ADMIN', 'RECEPCIONISTA')

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

  remove(@Param('id') id: string) {
    return this.propietariosService.remove(+id);
  }
}