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
import { DocumentosMedicosModule } from './documentos-medicos/documentos-medicos.module';
import { HistoriasClinicasModule } from './historias-clinicas/historias-clinicas.module';
import { MovimientosInventarioModule } from './movimientos-inventario/movimientos-inventario.module';
import { RegistroVacunasModule } from './registro-vacunas/registro-vacunas.module';
import { DetalleServiciosModule } from './detalle-servicios/detalle-servicios.module';
import { DetalleProductosModule } from './detalle-productos/detalle-productos.module';


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
    DocumentosMedicosModule,
    HistoriasClinicasModule,
    MovimientosInventarioModule,
    RegistroVacunasModule,
    DetalleServiciosModule,
    DetalleProductosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}