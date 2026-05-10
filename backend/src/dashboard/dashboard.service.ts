import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(user: any) {
    const { rol, sub } = user;

    // ADMIN
    if (rol === 'ADMIN') {
      return {
        totalMascotas: await this.prisma.mascotas.count(),
        totalPropietarios: await this.prisma.propietarios.count(),
        totalCitas: await this.prisma.citas.count(),
        citasPendientes: await this.prisma.citas.count({
          where: { estado: 'pendiente' },
        }),
        usuarios: await this.prisma.usuarios.count(),
      };
    }

    // VETERINARIO
    if (rol === 'VETERINARIO') {
      return {
        misCitas: await this.prisma.citas.count({
          where: { id_usuario: sub },
        }),
        citasPendientes: await this.prisma.citas.count({
          where: {
            id_usuario: sub,
            estado: 'pendiente',
          },
        }),
      };
    }

    // RECEPCIONISTA
    if (rol === 'RECEPCIONISTA') {
      return {
        citasHoy: await this.prisma.citas.count(),
        propietarios: await this.prisma.propietarios.count(),
        mascotas: await this.prisma.mascotas.count(),
      };
    }

    // CLIENTE
    if (rol === 'CLIENTE') {
      return {
        misMascotas: await this.prisma.mascotas.count({
          where: { id_propietario: sub },
        }),
        misCitas: await this.prisma.citas.count({
          where: { id_usuario: sub },
        }),
      };
    }

    return {};
  }
}