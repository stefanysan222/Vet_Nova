// src/dashboard/interfaces/dashboard.interface.ts

export interface DashboardAdmin {
    totalMascotas: number;
    totalPropietarios: number;
    totalCitas: number;
    citasPendientes: number;
    usuarios: number;
    citasHoy: number;
  }
  
  export interface DashboardVeterinario {
    misCitas: number;
    citasPendientes: number;
  }
  
  export interface DashboardRecepcionista {
    citasHoy: number;
    propietarios: number;
    mascotas: number;
  }
  
  export interface DashboardCliente {
    misMascotas: number;
    misCitas: number;
  }
  
  export type DashboardResponse =
    | DashboardAdmin
    | DashboardVeterinario
    | DashboardRecepcionista
    | DashboardCliente;