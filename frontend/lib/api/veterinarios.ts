import { api } from "./client";

export interface VeterinarioPerfilAPI {
  especialidad: string | null;
  registroProfesional: string | null;
  telefono: string | null;
  horarioAtencion: string | null;
}

export interface VeterinarioPerfilUpdate {
  especialidad?: string;
  registroProfesional?: string;
  telefono?: string;
  horarioAtencion?: string;
}

export async function fetchMiPerfilVeterinario(): Promise<VeterinarioPerfilAPI> {
  return api.get<VeterinarioPerfilAPI>("/veterinarios/me");
}

export async function updateMiPerfilVeterinario(
  data: VeterinarioPerfilUpdate,
): Promise<VeterinarioPerfilAPI> {
  return api.patch<VeterinarioPerfilAPI>("/veterinarios/me", data);
}
