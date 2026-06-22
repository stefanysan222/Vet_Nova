import { api } from "./client";

export type TimelineEventType = "consulta" | "vacuna";

export interface TimelineEventAPI {
  tipo: TimelineEventType;
  fecha: string | null;
  titulo: string;
  descripcion: string | null;
  registradoPor?: string | null;
  proximaFecha?: string | null;
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
  URL.revokeObjectURL(url);
}
