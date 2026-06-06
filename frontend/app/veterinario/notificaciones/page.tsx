"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { getCurrentUser } from "../../../lib/auth";
import { fetchCitas } from "../../../lib/api/citas";
import type { Appointment } from "../../../lib/recepcionista/types";

type CategoriaNotificacion = "Citas" | "Seguimiento" | "Historial";
type FiltroNotificacion = "Todas" | "No leídas" | CategoriaNotificacion;

type IconName = "bell" | "calendar" | "history" | "activity" | "check" | "document" | "empty";

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
  icono: IconName;
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

  const iconoMap: Record<string, IconName> = {
    Finalizada: "check",
    "En atención": "activity",
    "En espera": "activity",
    Reprogramada: "history",
  };
  const icono = iconoMap[a.status] ?? "calendar";

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

  const noLeidas = notificaciones.filter((item) => !item.leida).length;

  const requierenAccion = notificaciones.filter(
    (item) => item.requiereAccion && !item.leida,
  ).length;

  useEffect(() => {
    const user = getCurrentUser();
    const limiteFecha = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    fetchCitas(user ? Number(user.id) : undefined)
      .then((appts) => {
        const recientes = appts
          .filter((a) => a.date >= limiteFecha && a.status !== "Cancelada")
          .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
        setNotificaciones(recientes.map(citaHaciaNotificacion));
      })
      .catch(() => {});
  }, []);

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
      <header className="notification-header relative overflow-hidden rounded-[28px] border border-[#D9E6FF] bg-gradient-to-r from-[#F7FAFF] via-white to-[#EEF6FF] p-7 shadow-[0_16px_38px_rgba(37,99,235,0.08)] dark:border-[#233552] dark:from-[#111827] dark:via-[#111827] dark:to-[#12213A]">
        <div className="notification-orb absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#DBEAFE]/70 blur-3xl dark:bg-[#2563EB]/20" />

        <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="notification-pulse relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-70" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#2563EB]" />
              </span>

              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2563EB] dark:text-[#93C5FD]">
                Notificaciones clínicas
              </p>
            </div>

            <h1 className="text-[32px] font-bold leading-tight text-[#10213A] dark:text-white">
              Alertas y seguimiento
            </h1>

            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#64748B] dark:text-[#94A3B8]">
              Consulta avisos relacionados con tus citas asignadas, pacientes en seguimiento e
              historiales clínicos actualizados.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ResumenBadge valor={noLeidas} texto="no leídas" variante="blue" />

            <ResumenBadge valor={requierenAccion} texto="requieren acción" variante="orange" />
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <section className="notification-panel rounded-[24px] border border-[#D9E2EF] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-[#334155] dark:bg-[#111827]">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
              Centro de notificaciones
            </h2>

            <p className="mt-1 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
              Revisa las alertas relevantes y accede directamente a cada acción clínica.
            </p>
          </div>

          <button
            type="button"
            onClick={marcarTodasComoLeidas}
            disabled={noLeidas === 0}
            className="flex h-[44px] items-center justify-center gap-2 rounded-xl border border-[#D6E3FF] bg-white px-5 text-[13px] font-semibold text-[#2563EB] transition hover:-translate-y-0.5 hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:bg-white dark:border-[#334155] dark:bg-[#111827] dark:text-[#93C5FD] dark:hover:bg-[#1E293B]"
          >
            <NotificationIcon name="check" className="h-[17px] w-[17px]" />
            Marcar todas como leídas
          </button>
        </div>

        {/* FILTROS */}
        <div className="mt-7 flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-5 dark:border-[#334155]">
          {filtros.map((filtro) => (
            <button
              key={filtro}
              type="button"
              onClick={() => setFiltroActivo(filtro)}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                filtroActivo === filtro
                  ? "bg-[#2F6BFF] text-white shadow-[0_6px_14px_rgba(47,107,255,0.18)]"
                  : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:text-[#CBD5E1] dark:hover:bg-[#334155]"
              }`}
            >
              {filtro}
              {filtro === "No leídas" && noLeidas > 0 && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${
                    filtroActivo === filtro
                      ? "bg-white/20 text-white"
                      : "bg-[#DBEAFE] text-[#2563EB] dark:bg-[#172554] dark:text-[#93C5FD]"
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
                    <h3 className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#64748B] dark:text-[#94A3B8]">
                      {grupo}
                    </h3>

                    <span className="h-px flex-1 bg-[#E2E8F0] dark:bg-[#334155]" />
                  </div>

                  <div className="space-y-4">
                    {itemsGrupo.map((item, index) => (
                      <TarjetaNotificacion
                        key={item.id}
                        item={item}
                        index={index}
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

      <style jsx global>{`
        @keyframes notification-fade-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes notification-orb-motion {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(-14px, 10px) scale(1.06);
          }
        }

        @keyframes notification-ring {
          0% {
            transform: scale(1);
            opacity: 0.65;
          }
          70% {
            transform: scale(2.1);
            opacity: 0;
          }
          100% {
            transform: scale(2.1);
            opacity: 0;
          }
        }

        .notification-header {
          animation: notification-fade-up 0.48s ease-out both;
        }

        .notification-orb {
          animation: notification-orb-motion 8s ease-in-out infinite;
        }

        .notification-pulse span:first-child {
          animation: notification-ring 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .notification-panel {
          animation: notification-fade-up 0.48s ease-out 0.12s both;
        }

        .notification-card {
          opacity: 0;
          animation: notification-fade-up 0.42s ease-out var(--delay) forwards;
          transition:
            transform 0.25s ease,
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .notification-card:hover {
          transform: translateY(-2px);
          border-color: #d6e3ff;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.07);
        }

        .notification-action-primary {
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .notification-action-primary:hover {
          transform: translateY(-2px);
          background: #2459df;
          box-shadow: 0 9px 18px rgba(47, 107, 255, 0.2);
        }

        .notification-action-secondary {
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .notification-action-secondary:hover {
          transform: translateY(-2px);
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .dark .notification-action-secondary:hover {
          background: #1e293b;
        }

        @media (prefers-reduced-motion: reduce) {
          .notification-header,
          .notification-orb,
          .notification-panel,
          .notification-card,
          .notification-pulse span:first-child {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          .notification-card:hover,
          .notification-action-primary:hover,
          .notification-action-secondary:hover {
            transform: none !important;
          }
        }
      `}</style>
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
  variante: "blue" | "orange";
}) {
  const estilos =
    variante === "blue"
      ? "border-[#DBEAFE] bg-[#EFF6FF] text-[#2563EB] dark:border-[#1E3A8A] dark:bg-[#172554] dark:text-[#BFDBFE]"
      : "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309] dark:border-[#78350F] dark:bg-[#451A03] dark:text-[#FDE68A]";

  return (
    <div className={`flex items-center gap-3 rounded-[16px] border px-4 py-3 ${estilos}`}>
      <p className="text-[23px] font-bold leading-none">{valor}</p>

      <p className="text-[13px] font-semibold">{texto}</p>
    </div>
  );
}

function TarjetaNotificacion({
  item,
  index,
  onMarcarLeida,
}: {
  item: Notificacion;
  index: number;
  onMarcarLeida: () => void;
}) {
  return (
    <article
      className={`notification-card relative overflow-hidden rounded-[20px] border p-5 ${
        item.leida
          ? "border-[#E5EAF2] bg-[#FBFCFF] dark:border-[#334155] dark:bg-[#0F172A]"
          : "border-[#D6E3FF] bg-[#F7FAFF] dark:border-[#29406B] dark:bg-[#121D33]"
      }`}
      style={
        {
          "--delay": `${index * 70}ms`,
        } as CSSProperties
      }
    >
      {!item.leida && <span className="absolute left-0 top-0 h-full w-1 bg-[#2F6BFF]" />}

      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
        <div className="flex min-w-0 gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] ${estiloIcono(
              item.categoria,
            )}`}
          >
            <NotificationIcon name={item.icono} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              {!item.leida && <span className="h-2.5 w-2.5 rounded-full bg-[#2F6BFF]" />}

              <h4 className="text-[16px] font-semibold text-[#10213A] dark:text-white">
                {item.titulo}
              </h4>

              {item.requiereAccion && (
                <span className="rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[11px] font-semibold text-[#B45309] dark:bg-[#78350F] dark:text-[#FDE68A]">
                  Requiere acción
                </span>
              )}

              <span className="rounded-full bg-[#EEF4FF] px-2.5 py-1 text-[11px] font-semibold text-[#2563EB] dark:bg-[#1E293B] dark:text-[#93C5FD]">
                {item.categoria}
              </span>
            </div>

            <p className="mt-3 text-[14px] font-semibold text-[#334155] dark:text-[#CBD5E1]">
              {item.paciente}
            </p>

            <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#64748B] dark:text-[#94A3B8]">
              {item.descripcion}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {item.acciones.map((accion) => (
                <Link
                  key={accion.label}
                  href={accion.href}
                  onClick={onMarcarLeida}
                  className={`flex h-[41px] items-center justify-center rounded-xl px-4 text-[13px] font-semibold ${
                    accion.principal
                      ? "notification-action-primary bg-[#2F6BFF] text-white"
                      : "notification-action-secondary border border-[#D6E3FF] bg-white text-[#2563EB] dark:border-[#334155] dark:bg-[#111827] dark:text-[#93C5FD]"
                  }`}
                >
                  {accion.label}
                </Link>
              ))}

              {!item.leida && (
                <button
                  type="button"
                  onClick={onMarcarLeida}
                  className="flex h-[41px] items-center justify-center rounded-xl px-4 text-[13px] font-semibold text-[#64748B] transition hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-[#1E293B]"
                >
                  Marcar como leída
                </button>
              )}
            </div>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-[#F1F5F9] px-3 py-2 text-[12px] font-semibold text-[#64748B] dark:bg-[#1E293B] dark:text-[#CBD5E1]">
          {item.tiempo}
        </span>
      </div>
    </article>
  );
}

function EstadoVacio({ filtro }: { filtro: FiltroNotificacion }) {
  return (
    <div className="mt-6 rounded-[20px] border border-dashed border-[#CBD5E1] bg-[#FBFCFF] px-6 py-14 text-center dark:border-[#334155] dark:bg-[#0F172A]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]">
        <NotificationIcon name="empty" className="h-7 w-7" />
      </div>

      <p className="mt-4 text-[16px] font-semibold text-[#10213A] dark:text-white">
        No hay notificaciones en esta categoría
      </p>

      <p className="mt-2 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
        No tienes alertas disponibles para el filtro <strong>{filtro}</strong>.
      </p>
    </div>
  );
}

function estiloIcono(categoria: CategoriaNotificacion) {
  switch (categoria) {
    case "Citas":
      return "bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]";

    case "Seguimiento":
      return "bg-[#FEF3C7] text-[#B45309] dark:bg-[#78350F] dark:text-[#FDE68A]";

    case "Historial":
      return "bg-[#EDE9FE] text-[#7C3AED] dark:bg-[#4C1D95] dark:text-[#DDD6FE]";
  }
}

function NotificationIcon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const props = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "bell":
      return (
        <svg {...props}>
          <path d="M18 16.8H6c1-1 1.7-2.3 1.7-5 0-2.8 1.8-5 4.3-5s4.3 2.2 4.3 5c0 2.7.7 4 1.7 5Z" />
          <path d="M10 19a2.2 2.2 0 0 0 4 0" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...props}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
          <path d="M7.5 3.5v3.5M16.5 3.5v3.5M3.5 9.5h17" />
          <path d="m8.5 14 2.1 2.1 4.6-5" />
        </svg>
      );

    case "history":
      return (
        <svg {...props}>
          <path d="M12 7v5l3.5 2" />
          <path d="M20.5 12a8.5 8.5 0 1 1-2.7-6.2" />
          <path d="M20.5 4.5v5h-5" />
        </svg>
      );

    case "activity":
      return (
        <svg {...props}>
          <path d="M3 12h4l2.2-4 4.1 8 2.3-4H21" />
          <path d="M12 21a9 9 0 1 0-9-9" />
        </svg>
      );

    case "check":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.6 2.7L16.5 9" />
        </svg>
      );

    case "document":
      return (
        <svg {...props}>
          <path d="M7 3.5h7l3 3V20.5H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" />
          <path d="M14 3.5v4h4" />
          <path d="M9 12h6M9 15.5h6" />
        </svg>
      );

    case "empty":
      return (
        <svg {...props}>
          <path d="M18 16.8H6c1-1 1.7-2.3 1.7-5 0-2.8 1.8-5 4.3-5s4.3 2.2 4.3 5c0 2.7.7 4 1.7 5Z" />
          <path d="M9 4.5 15 20" />
        </svg>
      );
  }
}
