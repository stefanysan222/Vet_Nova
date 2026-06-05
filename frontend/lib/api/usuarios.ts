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

export async function createUsuario(data: {
  nombre: string;
  email: string;
  password: string;
  rol?: string;
}): Promise<UsuarioAPI> {
  return api.post<UsuarioAPI>('/usuarios', data);
}

export async function updateUsuario(
  id: number,
  data: { nombre?: string; email?: string; rol?: string; password?: string },
): Promise<UsuarioAPI> {
  return api.put<UsuarioAPI>(`/usuarios/${id}`, data);
}

export async function deleteUsuario(id: number): Promise<void> {
  await api.delete(`/usuarios/${id}`);
}

export async function fetchStatsAdmin(): Promise<{
  totalUsuarios: number;
  veterinarios: number;
  administradores: number;
  clientes: number;
}> {
  const users = await fetchUsuarios();
  return {
    totalUsuarios: users.length,
    veterinarios: users.filter((u) => u.rol === 'Veterinario').length,
    administradores: users.filter((u) => u.rol === 'Administrador').length,
    clientes: users.filter((u) => u.rol === 'Cliente').length,
  };
}
