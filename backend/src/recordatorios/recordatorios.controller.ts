import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { RecordatoriosService } from './recordatorios.service';

import { CreateRecordatorioDto } from './dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto';

@Controller('recordatorios')
export class RecordatoriosController {
  constructor(
    private readonly recordatoriosService: RecordatoriosService,
  ) {}

  @Post()
  create(@Body() dto: CreateRecordatorioDto) {
    return this.recordatoriosService.create(dto);
  }

  @Get()
  findAll() {
    return this.recordatoriosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recordatoriosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRecordatorioDto,
  ) {
    return this.recordatoriosService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recordatoriosService.remove(+id);
  }
}