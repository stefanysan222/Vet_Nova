import { api } from "./client";
import type { Appointment } from "../recepcionista/types";

export interface CitaAPI {
  id_cita: number;
  fecha: string | null;
  hora: string | null;
  estado: string | null;
  servicio: string | null;
  notas: string | null;
  veterinario: string | null;
  id_mascota: number | null;
  id_usuario: number | null;
  mascotas?: {
    id_mascota: number;
    nombre: string | null;
    especie?: string | null;
    raza?: string | null;
    propietario?: {
      id_propietario: number;
      nombre: string | null;
    } | null;
  } | null;
  usuarios?: { id_usuario: number; nombre: string | null } | null;
}

const STATUS_MAP: Record<string, Appointment["status"]> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  "en espera": "En espera",
  "en atención": "En atención",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
  "no asistió": "No asistió",
  reprogramada: "Reprogramada",
};

const STATUS_REVERSE_MAP: Record<Appointment["status"], string> = {
  Pendiente: "pendiente",
  Confirmada: "confirmada",
  "En espera": "en espera",
  "En atención": "en atención",
  Finalizada: "finalizada",
  Cancelada: "cancelada",
  "No asistió": "no asistió",
  Reprogramada: "reprogramada",
};

export function mapCitaToAppointment(c: CitaAPI): Appointment {
  const fecha = c.fecha ? c.fecha.slice(0, 10) : "";
  const estado = c.estado?.toLowerCase() ?? "";
  return {
    id: String(c.id_cita),
    date: fecha,
    time: c.hora ?? "",
    petId: String(c.id_mascota ?? ""),
    ownerId: String(c.mascotas?.propietario?.id_propietario ?? ""),
    petName: c.mascotas?.nombre ?? "",
    ownerName: c.mascotas?.propietario?.nombre ?? "",
    service: c.servicio ?? "",
    status: STATUS_MAP[estado] ?? "Pendiente",
    veterinarian: c.veterinario ?? undefined,
    notes: c.notas ?? undefined,
    petEspecie: c.mascotas?.especie ?? undefined,
    petRaza: c.mascotas?.raza ?? undefined,
  };
}

interface CitasPaginatedResponse {
  data: CitaAPI[];
  total: number;
  page: number;
  lastPage: number;
}

export async function fetchCitas(
  id_usuario?: number,
  page = 1,
  limit = 100,
): Promise<Appointment[]> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (id_usuario) params.set("id_usuario", String(id_usuario));
  const response = await api.get<CitasPaginatedResponse>(`/citas?${params}`);
  return response.data.map(mapCitaToAppointment);
}

export async function createCita(
  appointment: Omit<Appointment, "id">,
  id_usuario?: number,
): Promise<Appointment> {
  const data = await api.post<CitaAPI>("/citas", {
    fecha: appointment.date
      ? new Date(appointment.date + "T00:00:00.000Z").toISOString()
      : undefined,
    hora: appointment.time,
    estado: STATUS_REVERSE_MAP[appointment.status] ?? "pendiente",
    servicio: appointment.service || undefined,
    notas: appointment.notes || undefined,
    veterinario: appointment.veterinarian || undefined,
    id_mascota: parseInt(appointment.petId, 10),
    id_usuario: id_usuario || undefined,
  });
  return mapCitaToAppointment(data);
}

export async function updateCitaEstado(
  id: string,
  status: Appointment["status"],
): Promise<Appointment> {
  const data = await api.put<CitaAPI>(`/citas/${id}`, {
    estado: STATUS_REVERSE_MAP[status] ?? "pendiente",
  });
  return mapCitaToAppointment(data);
}

export async function updateCita(appointment: Appointment): Promise<Appointment> {
  const data = await api.put<CitaAPI>(`/citas/${appointment.id}`, {
    fecha: appointment.date
      ? new Date(appointment.date + "T00:00:00.000Z").toISOString()
      : undefined,
    hora: appointment.time,
    estado: STATUS_REVERSE_MAP[appointment.status] ?? "pendiente",
    servicio: appointment.service || undefined,
    notas: appointment.notes || undefined,
  });
  return mapCitaToAppointment(data);
}

export async function deleteCita(id: string): Promise<void> {
  await api.delete(`/citas/${id}`);
}
