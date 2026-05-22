import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { VacunasService } from './vacunas.service';

import { CreateVacunaDto } from './dto/create-vacuna.dto';
import { UpdateVacunaDto } from './dto/update-vacuna.dto';

@Controller('vacunas')
export class VacunasController {
  constructor(private readonly vacunasService: VacunasService) {}

  @Post()
  create(@Body() dto: CreateVacunaDto) {
    return this.vacunasService.create(dto);
  }

  @Get()
  findAll() {
    return this.vacunasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vacunasService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVacunaDto,
  ) {
    return this.vacunasService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vacunasService.remove(+id);
  }
}