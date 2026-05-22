import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

import { MascotasService } from './mascotas.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

import { CreateMascotaDto } from './dto/create.mascota.dto';
import { UpdateMascotaDto } from './dto/update.mascotas.dto';

@ApiTags('Mascotas')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('mascotas')
export class MascotasController {
  constructor(
    private readonly mascotasService: MascotasService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // OBTENER TODAS
  @Get()
  @ApiOperation({
    summary: 'Obtener todas las mascotas',
  })

  @ApiResponse({
    status: 200,
    description: 'Lista obtenida correctamente',
  })

  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })

  findAll(
    @Query('nombre') nombre?: string,
  ) {
    return this.mascotasService.findAll(
      nombre,
    );
  }

  // CREAR
  @Post()

  @ApiOperation({
    summary: 'Crear mascota',
  })

  @ApiResponse({
    status: 201,
    description: 'Mascota creada correctamente',
  })

  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })

  create(
    @Body()
    dto: CreateMascotaDto,
  ) {
    return this.mascotasService.create(
      dto,
    );
  }

  // SUBIR FOTO
  @Post(':id/foto')

  @UseInterceptors(
    FileInterceptor('foto'),
  )

  @ApiOperation({
    summary: 'Subir foto de mascota',
  })

  @ApiConsumes(
    'multipart/form-data',
  )

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        foto: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })

  async subirFoto(
    @Param('id') id: string,

    @UploadedFile()
    archivo: Express.Multer.File,
  ) {
    const url =
      await this.cloudinaryService.subirImagen(
        archivo,
      );

    return this.mascotasService.actualizarFoto(
      +id,
      url,
    );
  }

  // OBTENER UNA
  @Get(':id')

  @ApiOperation({
    summary:
      'Obtener mascota por id',
  })

  @ApiResponse({
    status: 200,
    description: 'Mascota encontrada',
  })

  @ApiResponse({
    status: 404,
    description:
      'Mascota no encontrada',
  })

  findOne(
    @Param('id') id: string,
  ) {
    return this.mascotasService.findOne(
      +id,
    );
  }

  // ACTUALIZAR
  @Put(':id')

  @ApiOperation({
    summary:
      'Actualizar mascota',
  })

  @ApiResponse({
    status: 200,
    description:
      'Mascota actualizada',
  })

  update(
    @Param('id') id: string,

    @Body()
    dto: UpdateMascotaDto,
  ) {
    return this.mascotasService.updateMascota(
      +id,
      dto,
    );
  }

  // ELIMINAR
  @Delete(':id')

  @ApiOperation({
    summary:
      'Eliminar mascota',
  })

  @ApiResponse({
    status: 200,
    description:
      'Mascota eliminada',
  })

  @ApiResponse({
    status: 404,
    description:
      'Mascota no encontrada',
  })

  remove(
    @Param('id') id: string,
  ) {
    return this.mascotasService.deleteMascota(
      +id,
    );
  }
}