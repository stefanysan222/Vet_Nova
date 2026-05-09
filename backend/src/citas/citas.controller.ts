import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CitasService } from  './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';


@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  create(@Body() dto: CreateCitaDto) {
    return this.citasService.create(dto);
  }

  @Get()
  findAll() {
    return this.citasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.citasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCitaDto) {
    return this.citasService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.citasService.remove(+id);
  }
}