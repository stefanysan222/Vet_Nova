import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { VacunasService } from './vacunas.service';

import { CreateVacunaDto } from './dto/create-vacuna.dto';
import { UpdateVacunaDto } from './dto/update-vacuna.dto';

@ApiTags('Vacunas')
@ApiBearerAuth()
@Controller('vacunas')
export class VacunasController {
  constructor(private readonly vacunasService: VacunasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear vacuna' })
  @ApiResponse({
    status: 201,
    description: 'Vacuna creada correctamente',
  })
  create(@Body() dto: CreateVacunaDto) {
    return this.vacunasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener vacunas' })
  findAll() {
    return this.vacunasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener vacuna por ID' })
  findOne(@Param('id') id: string) {
    return this.vacunasService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar vacuna' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVacunaDto,
  ) {
    return this.vacunasService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar vacuna' })
  remove(@Param('id') id: string) {
    return this.vacunasService.remove(+id);
  }
}