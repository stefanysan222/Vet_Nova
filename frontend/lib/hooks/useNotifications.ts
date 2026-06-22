"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  fetchNotificaciones,
  fetchNotificacionesCount,
  marcarLeida as marcarLeidaApi,
  marcarTodasLeidas as marcarTodasLeidasApi,
  type NotificacionAPI,
} from "@/lib/api/notificaciones";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface UseNotificationsOptions {
  /** Si es false, el hook no conecta el socket ni carga datos (ej. usuario no autenticado todavía). */
  enabled?: boolean;
}

interface UseNotificationsResult {
  count: number;
  items: NotificacionAPI[] | null;
  /** Carga la lista de no leídas vía REST (llamar al abrir el dropdown). */
  loadItems: () => Promise<void>;
  marcarLeida: (id: number) => Promise<void>;
  marcarTodasLeidas: () => Promise<void>;
}

/**
 * Maneja el estado de notificaciones: carga inicial vía REST + actualizaciones
 * en tiempo real vía socket.io (evento "notification.new"). El marcado de
 * leído/leídas sigue siendo vía REST (PATCH).
 */
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsResult {
  const { enabled = true } = options;
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificacionAPI[] | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Carga inicial del contador vía REST.
  useEffect(() => {
    if (!enabled) return;
    fetchNotificacionesCount()
      .then(setCount)
      .catch(() => {});
  }, [enabled]);

  // Conexión socket.io: complementa la carga inicial, no la reemplaza.
  useEffect(() => {
    if (!enabled) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("notification.new", (notif: NotificacionAPI) => {
      setCount((prev) => prev + 1);
      setItems((prev) => (prev ? [notif, ...prev] : prev));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled]);

  const loadItems = useCallback(async () => {
    setItems(null);
    try {
      const data = await fetchNotificaciones(true);
      setItems(data);
    } catch {
      setItems([]);
    }
  }, []);

  const marcarLeida = useCallback(async (id: number) => {
    await marcarLeidaApi(id).catch(() => {});
    setItems((prev) => prev?.filter((n) => n.id !== id) ?? prev);
    setCount((c) => Math.max(0, c - 1));
  }, []);

  const marcarTodasLeidas = useCallback(async () => {
    await marcarTodasLeidasApi().catch(() => {});
    setItems([]);
    setCount(0);
  }, []);

  return { count, items, loadItems, marcarLeida, marcarTodasLeidas };
}
