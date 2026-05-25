import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { RegistroVacunasService } from './registro-vacunas.service';

import { CreateRegistroVacunaDto } from './dto/create-registro-vacuna.dto';
import { UpdateRegistroVacunaDto } from './dto/update-registro-vacuna.dto';

@Controller('registro-vacunas')
export class RegistroVacunasController {
  constructor(
    private readonly registroVacunasService: RegistroVacunasService,
  ) {}

  @Post()
  create(
    @Body()
    createRegistroVacunaDto: CreateRegistroVacunaDto,
  ) {
    return this.registroVacunasService.create(
      createRegistroVacunaDto,
    );
  }

  @Get()
  findAll() {
    return this.registroVacunasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registroVacunasService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateRegistroVacunaDto: UpdateRegistroVacunaDto,
  ) {
    return this.registroVacunasService.update(
      +id,
      updateRegistroVacunaDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registroVacunasService.remove(+id);
  }
}