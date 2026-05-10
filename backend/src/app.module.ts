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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}