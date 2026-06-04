import { api } from './client';

export interface UsuarioAPI {
  id: number;
  nombre: string | null;
  email: string;
  rol: string;
}

export async function fetchUsuarios(rol?: string): Promise<UsuarioAPI[]> {
  const path = rol ? `/usuarios?rol=${encodeURIComponent(rol)}` : '/usuarios';
  return api.get<UsuarioAPI[]>(path);
}

export async function fetchVeterinarios(): Promise<UsuarioAPI[]> {
  return fetchUsuarios('Veterinario');
}

export async function fetchStatsAdmin(): Promise<{
  totalUsuarios: number;
  veterinarios: number;
  recepcionistas: number;
  administradores: number;
}> {
  const users = await fetchUsuarios();
  return {
    totalUsuarios: users.length,
    veterinarios: users.filter((u) => u.rol === 'Veterinario').length,
    recepcionistas: users.filter((u) => u.rol === 'Recepcionista').length,
    administradores: users.filter((u) => u.rol === 'Administrador').length,
  };
}
