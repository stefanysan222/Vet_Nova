import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { MascotasModule } from './mascotas/mascotas.module';
import { PropietariosModule } from './propietarios/propietarios.module';
import { CitasModule } from './citas/citas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FacturasModule } from './facturas/facturas.module';
import { ServiciosModule } from './servicios/servicios.module';
import { ProductosModule } from './productos/productos.module';
import { VacunasModule } from './vacunas/vacunas.module';
import { RecordatoriosModule } from './recordatorios/recordatorios.module';
import { ConsultasModule } from './consultas/consultas.module';

@Module({
  imports: [
    PrismaModule,
    MascotasModule,
    PropietariosModule,
    CitasModule,
    UsuariosModule,
    AuthModule,
    DashboardModule,
    FacturasModule,
    ServiciosModule,
    ProductosModule,
    VacunasModule,
    RecordatoriosModule,
    ConsultasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}