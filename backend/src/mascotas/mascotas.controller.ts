import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';

import { MascotasService } from './mascotas.service';

import { CreateMascotaDto } from './dto/create.mascota.dto';
import { UpdateMascotaDto } from './dto/update.mascotas.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('mascotas')
export class MascotasController {
  constructor(private readonly mascotasService: MascotasService) {}

  @Post()
  create(@Body() dto: CreateMascotaDto) {
    return this.mascotasService.create(dto);
  }

  @Get()
  findAll() {
    return this.mascotasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mascotasService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMascotaDto,
  ) {
    return this.mascotasService.updateMascota(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mascotasService.deleteMascota(+id);
  }
}