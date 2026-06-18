import { api } from "./client";

export interface NotificacionAPI {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  creadaEn: string;
  tipo?: string;
}

export async function fetchNotificacionesCount(): Promise<number> {
  const res = await api.get<{ count: number }>("/notificaciones/count");
  return res.count;
}

export async function fetchNotificaciones(soloNoLeidas = false): Promise<NotificacionAPI[]> {
  const path = soloNoLeidas ? "/notificaciones?no_leidas=true" : "/notificaciones";
  return api.get<NotificacionAPI[]>(path);
}

export async function marcarLeida(id: number): Promise<void> {
  await api.patch(`/notificaciones/${id}/leer`);
}

export async function marcarTodasLeidas(): Promise<void> {
  await api.patch("/notificaciones/leer-todas");
}
