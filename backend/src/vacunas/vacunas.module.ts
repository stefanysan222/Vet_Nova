import { Module } from '@nestjs/common';

import { VacunasService } from './vacunas.service';
import { VacunasController } from './vacunas.controller';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VacunasController],
  providers: [VacunasService],
})
export class VacunasModule {}