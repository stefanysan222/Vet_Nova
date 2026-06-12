import { api } from "./client";

export interface ClinicaAPI {
  id_clinica: number;
  nombre: string;
  slug: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  estado: string;
  created_at: string;
}

export interface Clinica {
  id: number;
  nombre: string;
  slug: string;
  direccion: string;
  telefono: string;
  email: string;
  estado: string;
  createdAt: string;
}

function mapClinica(c: ClinicaAPI): Clinica {
  return {
    id: c.id_clinica,
    nombre: c.nombre,
    slug: c.slug,
    direccion: c.direccion ?? "",
    telefono: c.telefono ?? "",
    email: c.email ?? "",
    estado: c.estado,
    createdAt: c.created_at,
  };
}

export async function fetchClinicas(): Promise<Clinica[]> {
  const data = await api.get<ClinicaAPI[]>("/clinicas");
  return data.map(mapClinica);
}

export interface CreateClinicaPayload {
  nombre: string;
  slug: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  adminNombre: string;
  adminEmail: string;
  adminPassword: string;
}

export async function createClinica(payload: CreateClinicaPayload): Promise<Clinica> {
  const data = await api.post<ClinicaAPI>("/clinicas", payload);
  return mapClinica(data);
}

export interface UpdateClinicaPayload {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  estado?: "activa" | "inactiva";
}

export async function updateClinica(id: number, payload: UpdateClinicaPayload): Promise<Clinica> {
  const data = await api.put<ClinicaAPI>(`/clinicas/${id}`, payload);
  return mapClinica(data);
}

export interface ClinicaPublica {
  nombre: string;
  slug: string;
  estado: string;
}

export async function fetchClinicaBySlug(slug: string): Promise<ClinicaPublica | null> {
  const res = await fetch(`/api/backend/clinicas/by-slug/${encodeURIComponent(slug)}`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}

export interface ClinicaActiva {
  nombre: string;
  slug: string;
}

export async function fetchClinicasActivas(): Promise<ClinicaActiva[]> {
  const res = await fetch(`/api/backend/clinicas/activas`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}
