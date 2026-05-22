import { Module } from '@nestjs/common';
import { FacturasController } from './facturas.controller';
import { FacturasService } from './facturas.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FacturasController],
  providers: [FacturasService, PrismaService],
})
export class FacturasModule {}