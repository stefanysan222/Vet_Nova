// src/dashboard/dto/dashboard-response.dto.ts

export class DashboardAdminResponseDto {
    totalMascotas: number;
    totalPropietarios: number;
    totalCitas: number;
    citasPendientes: number;
    usuarios: number;
    citasHoy: number;
  }
  
  export class DashboardVeterinarioResponseDto {
    misCitas: number;
    citasPendientes: number;
  }
  
  export class DashboardRecepcionistaResponseDto {
    citasHoy: number;
    propietarios: number;
    mascotas: number;
  }
  
  export class DashboardClienteResponseDto {
    misMascotas: number;
    misCitas: number;
  }