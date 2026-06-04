import { api } from './client';

export interface ServicioAPI {
  id_servicio: number;
  nombre: string | null;
  precio: string | null;
}

export async function fetchServicios(): Promise<ServicioAPI[]> {
  return api.get<ServicioAPI[]>('/servicios');
}
