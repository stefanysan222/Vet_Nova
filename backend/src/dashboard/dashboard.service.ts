// src/dashboard/dashboard.service.ts

import { Injectable , ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { getRangoDia } from './utils/dashboard-date.util';

import {
  DashboardAdmin,
  DashboardVeterinario,
  DashboardRecepcionista,
  DashboardCliente,
} from './interfaces/dashboard.interface';


type DashboardResponse =
  | DashboardAdmin
  | DashboardVeterinario
  | DashboardRecepcionista
  | DashboardCliente;

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getDashboard(
    user: {
      rol: string;
      sub: string;
    },
  ): Promise<DashboardResponse> {
    const { rol, sub } = user;

    const userId = Number(sub);

    const { inicioDia, finDia } =
      getRangoDia();

    const citasHoyPromise =
      this.prisma.citas.count({
        where: {
          fecha: {
            gte: inicioDia,
            lt: finDia,
          },
        },
      });

    // ADMIN
    if (rol === 'ADMIN') {
      const [
        totalMascotas,
        totalPropietarios,
        totalCitas,
        citasPendientes,
        usuarios,
        citasHoy,
      ] = await Promise.all([
        this.prisma.mascotas.count(),

        this.prisma.propietarios.count(),

        this.prisma.citas.count(),

        this.prisma.citas.count({
          where: {
            estado: 'pendiente',
          },
        }),

        this.prisma.usuarios.count(),

        citasHoyPromise,
      ]);

      return {
        totalMascotas,
        totalPropietarios,
        totalCitas,
        citasPendientes,
        usuarios,
        citasHoy,
      };
    }

    // VETERINARIO
    if (rol === 'VETERINARIO') {
      const [
        misCitas,
        citasPendientes,
      ] = await Promise.all([
        this.prisma.citas.count({
          where: {
            id_usuario: userId,
          },
        }),

        this.prisma.citas.count({
          where: {
            id_usuario: userId,
            estado: 'pendiente',
          },
        }),
      ]);

      return {
        misCitas,
        citasPendientes,
      };
    }

    // RECEPCIONISTA
    if (rol === 'RECEPCIONISTA') {
      const [
        propietarios,
        mascotas,
        citasHoy,
      ] = await Promise.all([
        this.prisma.propietarios.count(),

        this.prisma.mascotas.count(),

        citasHoyPromise,
      ]);

      return {
        citasHoy,
        propietarios,
        mascotas,
      };
    }

    // CLIENTE
if (rol === 'CLIENTE') {
  const [
    misMascotas,
    misCitas,
  ] = await Promise.all([
    this.prisma.mascotas.count({
      where: {
        id_propietario: userId,
      },
    }),

    this.prisma.citas.count({
      where: {
        id_usuario: userId,
      },
    }),
  ]);

  return {
    misMascotas,
    misCitas,
  };
}

throw new ForbiddenException(
  'Rol no autorizado',
);
  }
}