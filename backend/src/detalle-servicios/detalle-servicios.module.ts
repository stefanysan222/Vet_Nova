import { Module } from '@nestjs/common';

import { DetalleServiciosController } from './detalle-servicios.controller';
import { DetalleServiciosService } from './detalle-servicios.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],

  controllers: [DetalleServiciosController],

  providers: [DetalleServiciosService],
})
export class DetalleServiciosModule {}