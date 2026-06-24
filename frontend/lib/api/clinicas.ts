import { api } from "./client";

export interface ClinicaAdminAPI {
  id_usuario: number;
  nombre: string | null;
  email: string;
}

export interface ClinicaAPI {
  id_clinica: number;
  nombre: string;
  slug: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  latitud: number | null;
  longitud: number | null;
  estado: string;
  created_at: string;
  admin?: ClinicaAdminAPI | null;
}

export interface ClinicaAdmin {
  id: number;
  nombre: string;
  email: string;
}

export interface Clinica {
  id: number;
  nombre: string;
  slug: string;
  direccion: string;
  telefono: string;
  email: string;
  latitud: number | null;
  longitud: number | null;
  estado: string;
  createdAt: string;
  admin: ClinicaAdmin | null;
}

function mapClinica(c: ClinicaAPI): Clinica {
  return {
    id: c.id_clinica,
    nombre: c.nombre,
    slug: c.slug,
    direccion: c.direccion ?? "",
    telefono: c.telefono ?? "",
    email: c.email ?? "",
    latitud: c.latitud ?? null,
    longitud: c.longitud ?? null,
    estado: c.estado,
    createdAt: c.created_at,
    admin: c.admin
      ? { id: c.admin.id_usuario, nombre: c.admin.nombre ?? "", email: c.admin.email }
      : null,
  };
}

export async function fetchClinicas(): Promise<Clinica[]> {
  const data = await api.get<ClinicaAPI[]>("/clinicas");
  return data.map(mapClinica);
}

export async function fetchClinica(id: number): Promise<Clinica> {
  const data = await api.get<ClinicaAPI>(`/clinicas/${id}`);
  return mapClinica(data);
}

export interface CreateClinicaPayload {
  nombre: string;
  slug: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  latitud?: number;
  longitud?: number;
  adminEmail: string;
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
  latitud?: number;
  longitud?: number;
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
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
}

export async function fetchClinicasActivas(): Promise<ClinicaActiva[]> {
  const res = await fetch(`/api/backend/clinicas/activas`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

export interface ChangeAdminPayload {
  newAdminEmail: string;
  newAdminNombre?: string;
}

export async function changeClinicaAdmin(
  id: number,
  payload: ChangeAdminPayload,
): Promise<Clinica> {
  const data = await api.patch<ClinicaAPI>(`/clinicas/${id}/admin`, payload);
  return mapClinica(data);
}

export interface AdminHistoryEntry {
  id: number;
  changedAt: string;
  previousAdmin: ClinicaAdmin | null;
  newAdmin: ClinicaAdmin;
  changedBy: ClinicaAdmin;
}

export interface AdminHistoryPage {
  data: AdminHistoryEntry[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

export async function fetchAdminHistory(
  id: number,
  page = 1,
  limit = 10,
): Promise<AdminHistoryPage> {
  return api.get<AdminHistoryPage>(`/clinicas/${id}/admin-history?page=${page}&limit=${limit}`);
}
