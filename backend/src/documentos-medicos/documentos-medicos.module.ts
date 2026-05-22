import { Module } from '@nestjs/common';

import { DocumentosMedicosController } from './documentos-medicos.controller';
import { DocumentosMedicosService } from './documentos-medicos.service';

import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    PrismaModule,
    CloudinaryModule,
  ],

  controllers: [
    DocumentosMedicosController,
  ],

  providers: [
    DocumentosMedicosService,
  ],
})
export class DocumentosMedicosModule {}