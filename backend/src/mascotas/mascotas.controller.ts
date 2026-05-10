import {
  Controller, Get, Post, Body, Param, Put,
  Delete, Query, UseInterceptors, UploadedFile,
  BadRequestException, ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';

import { MascotasService } from './mascotas.service';

@ApiTags('Mascotas')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('mascotas')
export class MascotasController {
  constructor(private readonly mascotasService: MascotasService) {}

  @Get()
  findAll(@Query('nombre') nombre?: string) {
    return this.mascotasService.findAll(nombre);
  }

  @Post()
  create(@Body() dto: any) {
    return this.mascotasService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mascotasService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.mascotasService.updateMascota(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mascotasService.deleteMascota(+id);
  }

  // ← adentro de la clase, antes del cierre }
  @Post(':id/foto')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { foto: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('foto', {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new BadRequestException('Solo imágenes'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async subirFoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() foto: Express.Multer.File,
  ) {
    const url = await this.mascotasService.subirFoto(id, foto);
    return { message: 'Foto subida correctamente', url };
  }

} // ← cierre de la clase al final