import { Module } from '@nestjs/common';

import { HistoriasClinicasController } from './historias-clinicas.controller';
import { HistoriasClinicasService } from './historias-clinicas.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],

  controllers: [HistoriasClinicasController],

  providers: [HistoriasClinicasService],
})
export class HistoriasClinicasModule {}