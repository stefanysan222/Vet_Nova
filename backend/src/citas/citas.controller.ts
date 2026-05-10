import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CitasService } from  './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';


@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()

  @Roles('ADMIN', 'RECEPCIONISTA')

  create(@Body() dto: CreateCitaDto) {
    return this.citasService.create(dto);
  }

  @Get()

  @Roles(
    'ADMIN',
    'VETERINARIO',
    'RECEPCIONISTA',
  )

 
findAll(
  @Query('estado') estado?: string,
) {
  return this.citasService.findAll(estado);
}

  @Get(':id')


  @Roles(
    'ADMIN',
    'VETERINARIO',
    'RECEPCIONISTA',
  )

  findOne(@Param('id') id: string) {
    return this.citasService.findOne(+id);
  }

  @Patch(':id')

  @Roles('ADMIN', 'VETERINARIO')

  update(@Param('id') id: string, @Body() dto: UpdateCitaDto) {
    return this.citasService.update(+id, dto);
  }

  @Delete(':id')

  @Roles('ADMIN')

  remove(@Param('id') id: string) {
    return this.citasService.remove(+id);
  }
}