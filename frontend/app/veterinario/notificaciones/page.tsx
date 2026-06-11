"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  History,
  Activity,
  CheckCircle2,
  BellOff,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { fetchCitas } from "../../../lib/api/citas";
import type { Appointment } from "../../../lib/recepcionista/types";

type CategoriaNotificacion = "Citas" | "Seguimiento" | "Historial";
type FiltroNotificacion = "Todas" | "No leídas" | CategoriaNotificacion;

interface AccionNotificacion {
  label: string;
  href: string;
  principal?: boolean;
}

interface Notificacion {
  id: number;
  categoria: CategoriaNotificacion;
  titulo: string;
  paciente: string;
  descripcion: string;
  tiempo: string;
  grupo: string;
  leida: boolean;
  requiereAccion: boolean;
  icono: LucideIcon;
  acciones: AccionNotificacion[];
}

function citaHaciaNotificacion(a: Appointment, idx: number): Notificacion {
  const hoy = new Date().toISOString().slice(0, 10);
  const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let grupo: string;
  if (a.date === hoy) grupo = "Hoy";
  else if (a.date === ayer) grupo = "Ayer";
  else {
    const d = new Date(a.date + "T00:00:00");
    grupo = d.toLocaleDateString("es-CO", { day: "numeric", month: "long" });
  }

  const categoriaMap: Record<string, CategoriaNotificacion> = {
    Finalizada: "Historial",
    "En atención": "Seguimiento",
    "En espera": "Seguimiento",
  };
  const categoria = categoriaMap[a.status] ?? "Citas";

  const iconoMap: Record<string, LucideIcon> = {
    Finalizada: CheckCircle2,
    "En atención": Activity,
    "En espera": Activity,
    Reprogramada: History,
  };
  const icono = iconoMap[a.status] ?? CalendarDays;

  const requiereAccion = ["Confirmada", "En atención", "En espera"].includes(a.status);
  const leida = ["Finalizada", "Cancelada", "No asistió"].includes(a.status);

  const titulos: Record<string, string> = {
    Confirmada: "Cita confirmada para atención",
    Pendiente: "Solicitud pendiente de confirmación",
    "En atención": "Paciente en atención",
    "En espera": "Paciente en espera",
    Finalizada: "Consulta finalizada",
    Cancelada: "Cita cancelada",
    "No asistió": "Paciente no asistió",
    Reprogramada: "Cita reprogramada",
  };
  const titulo = titulos[a.status] ?? "Notificación clínica";

  const descripciones: Record<string, string> = {
    Confirmada: "La cita fue confirmada y el paciente puede ser atendido.",
    Pendiente: "La solicitud fue registrada y está pendiente de confirmación por administración.",
    "En atención": "El paciente está siendo atendido en este momento.",
    "En espera": "El paciente se encuentra en sala de espera.",
    Finalizada: "La consulta fue finalizada y el expediente está disponible.",
    Cancelada: "La cita fue cancelada.",
    "No asistió": "El paciente no se presentó a la cita programada.",
    Reprogramada: "La cita fue reprogramada a una nueva fecha.",
  };
  const descripcion = descripciones[a.status] ?? "";

  const acciones: AccionNotificacion[] = [{ label: "Ver agenda", href: "/veterinario/citas" }];
  if (requiereAccion) {
    acciones.push({ label: "Ir a la cita", href: "/veterinario/citas", principal: true });
  }
  if (categoria === "Historial") {
    acciones[0] = { label: "Ver historial", href: "/veterinario/historial" };
  }

  return {
    id: idx + 1,
    categoria,
    titulo,
    paciente: [a.petName, a.service || "Consulta", a.time].filter(Boolean).join(" · "),
    descripcion,
    tiempo: a.date || "",
    grupo,
    leida,
    requiereAccion,
    icono,
    acciones,
  };
}

const filtros: FiltroNotificacion[] = ["Todas", "No leídas", "Citas", "Seguimiento", "Historial"];

export default function VeterinarioNotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [filtroActivo, setFiltroActivo] = useState<FiltroNotificacion>("Todas");
  const { user } = useAuth();

  const noLeidas = notificaciones.filter((item) => !item.leida).length;

  const requierenAccion = notificaciones.filter(
    (item) => item.requiereAccion && !item.leida,
  ).length;

  useEffect(() => {
    const limiteFecha = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    fetchCitas(user ? Number(user.id) : undefined)
      .then((appts) => {
        const recientes = appts
          .filter((a) => a.date >= limiteFecha && a.status !== "Cancelada")
          .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
        setNotificaciones(recientes.map(citaHaciaNotificacion));
      })
      .catch(() => {});
  }, [user]);

  const notificacionesFiltradas = useMemo(() => {
    if (filtroActivo === "Todas") {
      return notificaciones;
    }

    if (filtroActivo === "No leídas") {
      return notificaciones.filter((item) => !item.leida);
    }

    return notificaciones.filter((item) => item.categoria === filtroActivo);
  }, [filtroActivo, notificaciones]);

  const grupos = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const n of notificacionesFiltradas) {
      if (!seen.has(n.grupo)) {
        seen.add(n.grupo);
        result.push(n.grupo);
      }
    }
    return result;
  }, [notificacionesFiltradas]);

  function marcarComoLeida(id: number) {
    setNotificaciones((actuales) =>
      actuales.map((item) => (item.id === id ? { ...item, leida: true } : item)),
    );
  }

  function marcarTodasComoLeidas() {
    setNotificaciones((actuales) => actuales.map((item) => ({ ...item, leida: true })));
  }

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <header className="overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-600 to-brand-700 p-7 text-white shadow-brand">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-200">
              Notificaciones clínicas
            </p>

            <h1 className="text-display">Alertas y seguimiento</h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-100">
              Consulta avisos relacionados con tus citas asignadas, pacientes en seguimiento e
              historiales clínicos actualizados.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ResumenBadge valor={noLeidas} texto="no leídas" variante="brand" />

            <ResumenBadge valor={requierenAccion} texto="requieren acción" variante="warning" />
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-700 dark:bg-surface-900">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-section-title">Centro de notificaciones</h2>

            <p className="text-subtitle mt-1">
              Revisa las alertas relevantes y accede directamente a cada acción clínica.
            </p>
          </div>

          <button
            type="button"
            onClick={marcarTodasComoLeidas}
            disabled={noLeidas === 0}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white px-5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white dark:border-surface-700 dark:bg-surface-900 dark:text-brand-400 dark:hover:bg-brand-950/30"
          >
            <CheckCircle2 className="h-[17px] w-[17px]" />
            Marcar todas como leídas
          </button>
        </div>

        {/* FILTROS */}
        <div className="mt-7 flex flex-wrap gap-2 border-b border-surface-100 pb-5 dark:border-surface-800">
          {filtros.map((filtro) => (
            <button
              key={filtro}
              type="button"
              onClick={() => setFiltroActivo(filtro)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                filtroActivo === filtro
                  ? "bg-brand-600 text-white"
                  : "bg-surface-100 text-surface-500 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
              }`}
            >
              {filtro}
              {filtro === "No leídas" && noLeidas > 0 && (
                <span
                  className={`ml-2 rounded-lg px-2 py-0.5 text-xs ${
                    filtroActivo === filtro
                      ? "bg-white/20 text-white"
                      : "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"
                  }`}
                >
                  {noLeidas}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* LISTADO AGRUPADO */}
        {notificacionesFiltradas.length > 0 ? (
          <div className="mt-6 space-y-7">
            {grupos.map((grupo) => {
              const itemsGrupo = notificacionesFiltradas.filter((item) => item.grupo === grupo);

              if (itemsGrupo.length === 0) {
                return null;
              }

              return (
                <div key={grupo}>
                  <div className="mb-4 flex items-center gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-surface-500 dark:text-surface-400">
                      {grupo}
                    </h3>

                    <span className="h-px flex-1 bg-surface-200 dark:bg-surface-700" />
                  </div>

                  <div className="space-y-4">
                    {itemsGrupo.map((item) => (
                      <TarjetaNotificacion
                        key={item.id}
                        item={item}
                        onMarcarLeida={() => marcarComoLeida(item.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EstadoVacio filtro={filtroActivo} />
        )}
      </section>
    </div>
  );
}

function ResumenBadge({
  valor,
  texto,
  variante,
}: {
  valor: number;
  texto: string;
  variante: "brand" | "warning";
}) {
  const estilos =
    variante === "brand"
      ? "border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-800 dark:bg-brand-950/30 dark:text-brand-300"
      : "border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-800 dark:bg-warning-950/30 dark:text-warning-300";

  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${estilos}`}>
      <p className="text-2xl font-bold leading-none">{valor}</p>

      <p className="text-sm font-semibold">{texto}</p>
    </div>
  );
}

function TarjetaNotificacion({
  item,
  onMarcarLeida,
}: {
  item: Notificacion;
  onMarcarLeida: () => void;
}) {
  const Icono = item.icono;

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-card-hover ${
        item.leida
          ? "border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-950"
          : "border-brand-200 bg-brand-50/40 dark:border-brand-800 dark:bg-brand-950/20"
      }`}
    >
      {!item.leida && <span className="absolute left-0 top-0 h-full w-1 bg-brand-500" />}

      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
        <div className="flex min-w-0 gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${estiloIcono(
              item.categoria,
            )}`}
          >
            <Icono className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              {!item.leida && <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />}

              <h4 className="text-sm font-semibold text-surface-900 dark:text-white">
                {item.titulo}
              </h4>

              {item.requiereAccion && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-warning-100 px-2.5 py-1 text-xs font-semibold text-warning-700 dark:bg-warning-900/40 dark:text-warning-300">
                  Requiere acción
                </span>
              )}

              <span className="inline-flex items-center gap-1 rounded-lg bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                {item.categoria}
              </span>
            </div>

            <p className="mt-3 text-sm font-semibold text-surface-900 dark:text-white">
              {item.paciente}
            </p>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-surface-500 dark:text-surface-400">
              {item.descripcion}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {item.acciones.map((accion) => (
                <Link
                  key={accion.label}
                  href={accion.href}
                  onClick={onMarcarLeida}
                  className={`flex h-10 items-center justify-center rounded-xl px-4 text-xs font-semibold transition ${
                    accion.principal
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : "border border-brand-200 bg-white text-brand-600 hover:bg-brand-50 dark:border-surface-700 dark:bg-surface-900 dark:text-brand-400 dark:hover:bg-brand-950/30"
                  }`}
                >
                  {accion.label}
                </Link>
              ))}

              {!item.leida && (
                <button
                  type="button"
                  onClick={onMarcarLeida}
                  className="flex h-10 items-center justify-center rounded-xl px-4 text-xs font-semibold text-surface-500 transition hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
                >
                  Marcar como leída
                </button>
              )}
            </div>
          </div>
        </div>

        <span className="shrink-0 rounded-lg bg-surface-100 px-3 py-2 text-xs font-semibold text-surface-500 dark:bg-surface-800 dark:text-surface-300">
          {item.tiempo}
        </span>
      </div>
    </article>
  );
}

function EstadoVacio({ filtro }: { filtro: FiltroNotificacion }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-surface-300 bg-surface-50 px-6 py-14 text-center dark:border-surface-700 dark:bg-surface-950">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
        <BellOff className="h-7 w-7" />
      </div>

      <p className="mt-4 text-sm font-semibold text-surface-900 dark:text-white">
        No hay notificaciones en esta categoría
      </p>

      <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
        No tienes alertas disponibles para el filtro <strong>{filtro}</strong>.
      </p>
    </div>
  );
}

function estiloIcono(categoria: CategoriaNotificacion) {
  switch (categoria) {
    case "Citas":
      return "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300";

    case "Seguimiento":
      return "bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300";

    case "Historial":
      return "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300";
  }
}
