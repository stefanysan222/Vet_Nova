import { Module } from '@nestjs/common';

import { DetalleProductosController } from './detalle-productos.controller';
import { DetalleProductosService } from './detalle-productos.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],

  controllers: [DetalleProductosController],

  providers: [DetalleProductosService],
})
export class DetalleProductosModule {}
