import { Module } from '@nestjs/common';

import { RegistroVacunasController } from './registro-vacunas.controller';
import { RegistroVacunasService } from './registro-vacunas.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],

  controllers: [RegistroVacunasController],

  providers: [RegistroVacunasService],
})
export class RegistroVacunasModule {}