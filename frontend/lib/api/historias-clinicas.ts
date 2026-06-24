import { api } from "./client";

export type TimelineEventType = "consulta" | "vacuna";

export interface TimelineEventAPI {
  tipo: TimelineEventType;
  fecha: string | null;
  titulo: string;
  descripcion: string | null;
  registradoPor?: string | null;
  proximaFecha?: string | null;
  idConsulta?: number;
}

export interface ClinicalHistoryAPI {
  mascota: {
    id_mascota: number;
    nombre: string | null;
    especie: string | null;
    raza: string | null;
    clinica: string | null;
  };
  eventos: TimelineEventAPI[];
}

const PROXY_BASE = "/api/backend";
const CSRF_COOKIE = "vetnova-csrf";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function fetchClinicalHistory(petId: number): Promise<ClinicalHistoryAPI> {
  return api.get<ClinicalHistoryAPI>(`/historias-clinicas/mascota/${petId}/timeline`);
}

export interface CreateConsultaPayload {
  id_mascota: number;
  motivo?: string;
  diagnostico?: string;
  tratamiento?: string;
  peso?: number;
  temperatura?: number;
  frecuencia_cardiaca?: number;
  recomendaciones?: string;
}

export interface ConsultaAPI {
  id_consulta: number;
  fecha: string | null;
  motivo: string | null;
  diagnostico: string | null;
  tratamiento: string | null;
  peso: string | null;
  temperatura: string | null;
  frecuencia_cardiaca: number | null;
  recomendaciones: string | null;
  id_historia: number | null;
  id_usuario: number | null;
}

/**
 * Crea una consulta clínica real (persiste en historias_clinicas/consultas),
 * la misma fuente que alimenta el timeline y el PDF del Cliente.
 */
export async function createConsulta(payload: CreateConsultaPayload): Promise<ConsultaAPI> {
  return api.post<ConsultaAPI>("/historias-clinicas/consultas", payload);
}

/**
 * Obtiene una consulta con sus campos clínicos estructurados (no el
 * `descripcion` combinado del timeline), usado para precargar el
 * formulario de edición.
 */
export async function fetchConsulta(id: number): Promise<ConsultaAPI> {
  return api.get<ConsultaAPI>(`/historias-clinicas/consultas/${id}`);
}

export interface UpdateConsultaPayload {
  motivoAuditoria?: string;
  motivo?: string;
  diagnostico?: string;
  tratamiento?: string;
  peso?: number;
  temperatura?: number;
  frecuencia_cardiaca?: number;
  recomendaciones?: string;
}

/**
 * Edita una consulta clínica existente. Si quien edita no es el autor
 * original, el backend exige `motivoAuditoria` (400 si falta).
 */
export async function updateConsulta(
  id: number,
  payload: UpdateConsultaPayload,
): Promise<ConsultaAPI> {
  return api.put<ConsultaAPI>(`/historias-clinicas/consultas/${id}`, payload);
}

/**
 * Elimina (soft-delete) una consulta clínica. Si quien elimina no es el
 * autor original, el backend exige `motivoAuditoria` (400 si falta).
 */
export async function deleteConsulta(
  id: number,
  motivoAuditoria?: string,
): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/historias-clinicas/consultas/${id}`, {
    motivoAuditoria,
  });
}

export interface AuditoriaConsultaAPI {
  id_auditoria: number;
  accion: string;
  motivo: string | null;
  created_at: string;
  usuarios?: { nombre: string | null } | null;
}

/**
 * Lista la auditoría de cambios de una consulta (solo Administrador).
 */
export async function fetchConsultaAuditoria(idConsulta: number): Promise<AuditoriaConsultaAPI[]> {
  return api.get<AuditoriaConsultaAPI[]>(`/historias-clinicas/consultas/${idConsulta}/auditoria`);
}

/**
 * Descarga el PDF del historial clínico de una mascota y dispara la
 * descarga en el navegador usando un Blob + enlace temporal.
 */
export async function downloadClinicalHistoryPdf(petId: number, fileName?: string): Promise<void> {
  const res = await fetch(`${PROXY_BASE}/historias-clinicas/mascota/${petId}/download`, {
    credentials: "include",
    headers: {
      ...(readCookie(CSRF_COOKIE) ? { "x-csrf-token": readCookie(CSRF_COOKIE)! } : {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error(
      res.status === 403
        ? "No tienes permiso para descargar este historial."
        : "No se pudo generar el PDF del historial clínico.",
    );
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName ?? `historial-clinico-${petId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revocar el blob de inmediato compite con el navegador iniciando la
  // descarga (sobre todo con verificaciones de seguridad como Edge
  // SmartScreen), causando que el archivo se guarde sin nombre/extensión.
  // Un retraso le da tiempo al navegador a tomar la referencia del blob.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
