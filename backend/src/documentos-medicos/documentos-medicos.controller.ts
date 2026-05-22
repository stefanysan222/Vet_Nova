import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
  Get,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';

import { DocumentosMedicosService } from './documentos-medicos.service';

import { CloudinaryService } from '../cloudinary/cloudinary.service';

import { CreateDocumentoDto } from './dto/create-documentos-medico.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Documentos Médicos')
@ApiBearerAuth('access-token')

@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)

@Controller('documentos-medicos')
export class DocumentosMedicosController {
  constructor(
    private readonly documentosService: DocumentosMedicosService,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // SUBIR DOCUMENTO
  @Post(':idMascota')

  @Roles(
    'ADMIN',
    'VETERINARIO',
  )

  @UseInterceptors(
    FileInterceptor('archivo'),
  )

  @ApiOperation({
    summary:
      'Subir documento médico a una mascota',
  })

  @ApiConsumes(
    'multipart/form-data',
  )

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        archivo: {
          type: 'string',
          format: 'binary',
        },
        nombre: {
          type: 'string',
        },
        descripcion: {
          type: 'string',
        },
      },
    },
  })

  @ApiResponse({
    status: 201,
    description:
      'Documento subido correctamente',
  })

  @ApiResponse({
    status: 404,
    description:
      'Mascota no encontrada',
  })

  async subirDocumento(
    @Param('idMascota')
    idMascota: string,

    @UploadedFile()
    archivo: Express.Multer.File,

    @Body()
    dto: CreateDocumentoDto,
  ) {
    const url =
      await this.cloudinaryService.subirImagen(
        archivo,
      );

    return this.documentosService.crear(
      +idMascota,
      dto,
      url,
    );
  }

  // OBTENER DOCUMENTOS POR MASCOTA
  @Get('mascota/:id')

  @Roles(
    'ADMIN',
    'VETERINARIO',
    'RECEPCIONISTA',
    'CLIENTE',
  )

  @ApiOperation({
    summary:
      'Obtener documentos médicos de una mascota',
  })

  @ApiResponse({
    status: 200,
    description:
      'Documentos obtenidos correctamente',
  })

  @ApiResponse({
    status: 404,
    description:
      'Mascota no encontrada',
  })

  findByMascota(
    @Param('id')
    id: string,
  ) {
    return this.documentosService.findByMascota(
      +id,
    );
  }
}