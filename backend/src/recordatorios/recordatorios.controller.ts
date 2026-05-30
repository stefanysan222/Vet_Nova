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

import { RecordatoriosService } from './recordatorios.service';

import { CreateRecordatorioDto } from './dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto';

@ApiTags('Recordatorios')
@ApiBearerAuth()
@Controller('recordatorios')
export class RecordatoriosController {
  constructor(
    private readonly recordatoriosService: RecordatoriosService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear recordatorio' })
  @ApiResponse({
    status: 201,
    description: 'Recordatorio creado correctamente',
  })
  create(@Body() dto: CreateRecordatorioDto) {
    return this.recordatoriosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener recordatorios' })
  findAll() {
    return this.recordatoriosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener recordatorio por ID' })
  findOne(@Param('id') id: string) {
    return this.recordatoriosService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar recordatorio' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRecordatorioDto,
  ) {
    return this.recordatoriosService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar recordatorio' })
  remove(@Param('id') id: string) {
    return this.recordatoriosService.remove(+id);
  }
}