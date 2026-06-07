"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { fetchCitas, updateCitaEstado } from "../../../lib/api/citas";
import type { Appointment } from "../../../lib/recepcionista/types";
import { getStatusStyle } from "../../../lib/utils/status";

type EstadoCita = "Confirmada" | "Pendiente" | "Completada" | "Cancelada";
type FiltroCita = "todas" | "proximas" | "confirmadas" | "canceladas";

type Cita = {
  id: string;
  mascota: string;
  especie: string;
  servicio: string;
  fecha: string;
  fechaCorta: string;
  dia: string;
  hora: string;
  veterinario: string;
  motivo: string;
  estado: EstadoCita;
};

const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

function appointmentToCita(a: Appointment): Cita {
  const d = a.date ? new Date(a.date + "T00:00:00") : new Date();
  const especie = [a.petEspecie, a.petRaza].filter(Boolean).join(" · ");
  const estadoMap: Record<string, EstadoCita> = {
    Confirmada: "Confirmada",
    Pendiente: "Pendiente",
    Finalizada: "Completada",
    Cancelada: "Cancelada",
  };
  return {
    id: a.id,
    mascota: a.petName,
    especie: especie || a.petName,
    servicio: a.service || "Consulta",
    fecha: d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }),
    fechaCorta: String(d.getDate()),
    dia: MONTHS[d.getMonth()],
    hora: a.time,
    veterinario: a.veterinarian || "Por asignar",
    motivo: a.notes || "",
    estado: estadoMap[a.status] ?? "Pendiente",
  };
}

export default function AgendarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center bg-slate-50 dark:bg-slate-950">
          <p className="text-sm text-slate-500 dark:text-slate-400">Cargando citas...</p>
        </div>
      }
    >
      <AgendarContent />
    </Suspense>
  );
}

function AgendarContent() {
  const searchParams = useSearchParams();
  const solicitudEnviada = searchParams.get("solicitud") === "enviada";

  const [citas, setCitas] = useState<Cita[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroCita>("todas");
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [cargado, setCargado] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(solicitudEnviada);
  const { user } = useAuth();

  const cargarCitas = async () => {
    if (!user) {
      setCargado(true);
      return;
    }
    try {
      const apiCitas = await fetchCitas();
      setCitas(apiCitas.map(appointmentToCita));
    } catch {
      setCitas([]);
    } finally {
      setCargado(true);
    }
  };

  useEffect(() => {
    // Carga inicial de datos al montar — setCargado(true) tras el fetch es el patrón estándar
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarCitas();
  }, [user]);

  const citasFiltradas = useMemo(() => {
    const termino = normalizarTexto(busqueda.trim());

    return citas.filter((cita) => {
      const coincideBusqueda =
        termino === "" ||
        normalizarTexto(cita.mascota).includes(termino) ||
        normalizarTexto(cita.especie).includes(termino) ||
        normalizarTexto(cita.servicio).includes(termino) ||
        normalizarTexto(cita.veterinario).includes(termino) ||
        normalizarTexto(cita.motivo).includes(termino);

      const coincideFiltro =
        filtro === "todas" ||
        (filtro === "proximas" && (cita.estado === "Pendiente" || cita.estado === "Confirmada")) ||
        (filtro === "confirmadas" && cita.estado === "Confirmada") ||
        (filtro === "canceladas" && cita.estado === "Cancelada");

      return coincideBusqueda && coincideFiltro;
    });
  }, [busqueda, citas, filtro]);

  const totalProximas = citas.filter(
    (cita) => cita.estado === "Pendiente" || cita.estado === "Confirmada",
  ).length;

  const totalConfirmadas = citas.filter((cita) => cita.estado === "Confirmada").length;

  const totalPendientes = citas.filter((cita) => cita.estado === "Pendiente").length;

  const cancelarCita = async (id: string) => {
    try {
      await updateCitaEstado(id, "Cancelada");
      await cargarCitas();
    } catch {
      // update local state optimistically if API fails
      setCitas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: "Cancelada" as EstadoCita } : c)),
      );
    }

    setCitaSeleccionada((actual) =>
      actual?.id === id ? { ...actual, estado: "Cancelada" as EstadoCita } : actual,
    );
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltro("todas");
  };

  if (!cargado) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-sm text-slate-500 dark:text-slate-400">Cargando citas...</p>
      </div>
    );
  }

  return (
    <div className="admin-page h-full overflow-y-auto">
      {/* Banner de solicitud enviada */}
      {bannerVisible && (
        <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-800 dark:bg-emerald-950/30">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-[#15803D]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="m8 12 2.5 2.5L16 9" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Solicitud enviada correctamente
              </p>
              <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
                Tu cita quedó registrada como <strong>Pendiente</strong>. La clínica la revisará y
                te notificará cuando sea confirmada.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBannerVisible(false)}
            className="shrink-0 text-lg font-semibold text-emerald-700 dark:text-emerald-300"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      )}

      {/* Encabezado */}
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-page-title">Mis citas</h1>
          <p className="text-subtitle mt-2">
            Consulta y administra las citas programadas para tus mascotas
          </p>
        </div>
        <Link href="/cliente/agendar/nueva" className="btn-primary whitespace-nowrap">
          <PlusIcon />
          Nueva cita
        </Link>
      </div>

      {/* Tarjetas de resumen */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            title: "Próximas citas",
            value: totalProximas,
            desc: "Citas por atender",
            icon: <CalendarIcon />,
            accent: "bg-brand-500",
          },
          {
            title: "Confirmadas",
            value: totalConfirmadas,
            desc: "Horario confirmado",
            icon: <CalendarCheckIcon />,
            accent: "bg-emerald-500",
          },
          {
            title: "Pendientes",
            value: totalPendientes,
            desc: "En espera de confirmación",
            icon: <ClockIcon />,
            accent: "bg-amber-500",
          },
        ].map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
          >
            <SummaryCard
              title={s.title}
              value={s.value}
              description={s.desc}
              icon={s.icon}
              accent={s.accent}
            />
          </motion.div>
        ))}
      </div>

      {/* Buscador y filtros */}
      <section className="admin-card mb-6 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex h-[46px] flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition-all focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/10 dark:border-slate-700 dark:bg-slate-900">
            <SearchIcon />

            <input
              type="text"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por mascota, servicio o veterinario..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            />

            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                aria-label="Limpiar búsqueda"
                className="text-slate-400 transition-colors hover:text-brand-600"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton active={filtro === "todas"} onClick={() => setFiltro("todas")}>
              Todas
            </FilterButton>

            <FilterButton active={filtro === "proximas"} onClick={() => setFiltro("proximas")}>
              Próximas
            </FilterButton>

            <FilterButton
              active={filtro === "confirmadas"}
              onClick={() => setFiltro("confirmadas")}
            >
              Confirmadas
            </FilterButton>

            <FilterButton active={filtro === "canceladas"} onClick={() => setFiltro("canceladas")}>
              Canceladas
            </FilterButton>
          </div>
        </div>
      </section>

      {/* Listado de citas */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-section-title">Citas programadas</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {citasFiltradas.length} {citasFiltradas.length === 1 ? "resultado" : "resultados"}
          </p>
        </div>

        {citasFiltradas.length > 0 ? (
          <div className="space-y-5">
            {citasFiltradas.map((cita) => (
              <article
                key={cita.id}
                className="admin-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-[92px] w-[92px] shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                      <span className="text-[28px] font-bold leading-none">{cita.fechaCorta}</span>

                      <span className="mt-2 text-[12px] font-semibold">{cita.dia}</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {cita.mascota}
                        </h3>

                        <StatusBadge estado={cita.estado} />
                      </div>

                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {cita.especie}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                        <DetailItem icon={<MedicalIcon />} text={cita.servicio} />

                        <DetailItem icon={<ClockSmallIcon />} text={cita.hora} />

                        <DetailItem icon={<UserIcon />} text={cita.veterinario} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-700 sm:flex-row xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
                    <button
                      type="button"
                      onClick={() => setCitaSeleccionada(cita)}
                      className="btn-secondary"
                    >
                      Ver detalle
                    </button>

                    {cita.estado !== "Cancelada" && cita.estado !== "Completada" && (
                      <button
                        type="button"
                        onClick={() => cancelarCita(cita.id)}
                        className="btn-danger"
                      >
                        Cancelar cita
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Motivo:</span>{" "}
                  {cita.motivo || "Sin motivo registrado"}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState onReset={limpiarFiltros} />
        )}
      </section>

      {/* Modal de detalle */}
      {citaSeleccionada && (
        <DetalleCitaModal
          cita={citaSeleccionada}
          onClose={() => setCitaSeleccionada(null)}
          onCancel={() => cancelarCita(citaSeleccionada.id)}
        />
      )}
    </div>
  );
}

function DetalleCitaModal({
  cita,
  onClose,
  onCancel,
}: {
  cita: Cita;
  onClose: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.body.style.overflow = overflowOriginal;
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0F172A]/55 px-4 py-8"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-detalle-cita"
        onClick={(event) => event.stopPropagation()}
        className="max-h-full w-full max-w-[680px] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-modal dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-7 py-6 dark:border-slate-700">
          <div className="flex items-start gap-4">
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
              <CalendarIcon />
            </div>

            <div>
              <h2 id="titulo-detalle-cita" className="text-section-title text-xl">
                Detalle de la cita
              </h2>

              <p className="text-subtitle mt-1">Información completa de la atención programada</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-7 py-6">
          <div className="flex flex-col justify-between gap-4 rounded-xl bg-slate-50 p-5 dark:bg-slate-800/50 sm:flex-row sm:items-center">
            <div>
              <p className="text-label">Mascota</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                {cita.mascota}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{cita.especie}</p>
            </div>

            <StatusBadge estado={cita.estado} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ModalInfoItem label="Fecha" value={cita.fecha} icon={<CalendarSmallIcon />} />
            <ModalInfoItem label="Hora" value={cita.hora} icon={<ClockSmallIcon />} />
            <ModalInfoItem label="Tipo de atención" value={cita.servicio} icon={<MedicalIcon />} />
            <ModalInfoItem label="Veterinario" value={cita.veterinario} icon={<UserIcon />} />
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-label">Motivo de la cita</p>
            <p className="mt-2 text-sm leading-6 text-slate-900 dark:text-white">
              {cita.motivo || "Sin motivo registrado"}
            </p>
          </div>

          {cita.estado === "Pendiente" && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-800 dark:bg-amber-950/30">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <p className="text-sm leading-6 text-amber-700 dark:text-amber-300">
                <strong>En revisión:</strong> tu solicitud fue recibida. La clínica la revisará y te
                confirmará el horario a la brevedad.
              </p>
            </div>
          )}

          {cita.estado === "Confirmada" && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 dark:border-emerald-800 dark:bg-emerald-950/30">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 2.5 2.5L16 9" />
              </svg>
              <p className="text-sm leading-6 text-emerald-700 dark:text-emerald-300">
                <strong>Cita confirmada.</strong> Recuerda asistir a tiempo con tu mascota.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 px-7 py-5 dark:border-slate-700 sm:flex-row">
          {cita.estado !== "Cancelada" && cita.estado !== "Completada" && (
            <button type="button" onClick={onCancel} className="btn-danger">
              Cancelar cita
            </button>
          )}

          <button type="button" onClick={onClose} className="btn-primary">
            Cerrar
          </button>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  accent = "bg-brand-500",
}: {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  accent?: string;
}) {
  return (
    <article className="admin-card relative overflow-hidden p-5">
      <div className={`absolute inset-y-0 left-0 w-1 rounded-l-2xl ${accent}`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label">{title}</p>
          <p className="text-stat mt-2 text-slate-900 dark:text-white">{value}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
          {icon}
        </div>
      </div>
    </article>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
        active
          ? "bg-brand-600 text-white shadow-brand-sm"
          : "border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-brand-600 dark:hover:text-brand-400"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ estado }: { estado: EstadoCita }) {
  const label = estado === "Pendiente" ? "Pendiente" : estado;
  const style = getStatusStyle(estado);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
}

function DetailItem({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#52698A] dark:text-[#94A3B8]">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function ModalInfoItem({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
        {icon}
      </div>
      <div>
        <p className="text-label">{label}</p>
        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center shadow-xs dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
        <CalendarEmptyIcon />
      </div>
      <h3 className="text-section-title">No se encontraron citas</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        No hay citas que coincidan con la búsqueda o filtro seleccionado.
      </p>
      <button type="button" onClick={onReset} className="btn-secondary mt-5">
        Limpiar filtros
      </button>
    </div>
  );
}

function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3v4M17 3v4M4.5 9.5h15M6.5 5h11a2 2 0 0 1 2 2v11.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 13h3M8 16h3M14 13h2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarSmallIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3v4M17 3v4M4.5 9.5h15M6.5 5h11a2 2 0 0 1 2 2v11.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarCheckIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3v4M17 3v4M4.5 9.5h15M6.5 5h11a2 2 0 0 1 2 2v11.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="m8.5 15 2.1 2.1 4.7-5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarEmptyIcon() {
  return (
    <svg width="31" height="31" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3v4M17 3v4M4.5 9.5h15M6.5 5h11a2 2 0 0 1 2 2v11.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M9 14.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ClockSmallIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MedicalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5V4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 20c.5-3.7 3-5.5 6.5-5.5s6 1.8 6.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
