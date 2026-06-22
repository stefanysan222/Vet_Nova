"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { fetchCitas, updateCitaEstado } from "../../../lib/api/citas";
import type { Appointment } from "../../../lib/recepcionista/types";
import { getStatusStyle } from "../../../lib/utils/status";
import InteractiveCalendar, {
  type CalendarAppointmentEvent,
} from "../../components/calendar/InteractiveCalendar";
import AppointmentDetailModal from "../../components/appointments/AppointmentDetailModal";
import {
  Plus,
  Search,
  X,
  CalendarDays,
  CalendarCheck,
  CalendarOff,
  Clock,
  ClipboardList,
  List,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroCita>("todas");
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [cargado, setCargado] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(solicitudEnviada);
  const [vistaActiva, setVistaActiva] = useState<"lista" | "calendario">("lista");
  const [citaCalendario, setCitaCalendario] = useState<Appointment | null>(null);
  const { user } = useAuth();

  const cargarCitas = async () => {
    if (!user) {
      setCargado(true);
      return;
    }
    try {
      const apiCitas = await fetchCitas();
      setCitas(apiCitas.map(appointmentToCita));
      setAppointments(apiCitas);
    } catch {
      setCitas([]);
      setAppointments([]);
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

  const calendarEvents = useMemo<CalendarAppointmentEvent[]>(() => {
    const idsFiltrados = new Set(citasFiltradas.map((c) => c.id));
    return appointments
      .filter((a) => a.date && idsFiltrados.has(a.id))
      .map((a) => {
        const [hh, mm] = (a.time || "00:00").split(":").map((n) => parseInt(n, 10) || 0);
        const start = new Date(`${a.date}T00:00:00`);
        start.setHours(hh, mm, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + 30);
        return {
          title: `${a.time ?? ""} ${a.petName}`.trim(),
          start,
          end,
          resource: a,
        };
      });
  }, [appointments, citasFiltradas]);

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
        <div className="dark:bg-success-950/30 mb-6 flex items-start justify-between gap-4 rounded-xl border border-success-200 bg-success-50 px-5 py-4 dark:border-success-800">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success-600" />
            <div>
              <p className="text-sm font-semibold text-success-700 dark:text-success-300">
                Solicitud enviada correctamente
              </p>
              <p className="mt-1 text-sm leading-6 text-success-700 dark:text-success-300">
                Tu cita quedó registrada como <strong>Pendiente</strong>. La clínica la revisará y
                te notificará cuando sea confirmada.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBannerVisible(false)}
            className="shrink-0 text-lg font-semibold text-success-700 dark:text-success-300"
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
          <Plus className="h-[18px] w-[18px]" />
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
            icon: <CalendarDays className="h-[25px] w-[25px]" />,
            accent: "bg-brand-500",
          },
          {
            title: "Confirmadas",
            value: totalConfirmadas,
            desc: "Horario confirmado",
            icon: <CalendarCheck className="h-[25px] w-[25px]" />,
            accent: "bg-success-500",
          },
          {
            title: "Pendientes",
            value: totalPendientes,
            desc: "En espera de confirmación",
            icon: <Clock className="h-[25px] w-[25px]" />,
            accent: "bg-accent-500",
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
            <Search className="h-[19px] w-[19px] shrink-0 text-slate-400" />

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
                <X className="h-[18px] w-[18px]" />
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-section-title">Citas programadas</h2>
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {citasFiltradas.length} {citasFiltradas.length === 1 ? "resultado" : "resultados"}
            </p>
            <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setVistaActiva("lista")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  vistaActiva === "lista"
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                Lista
              </button>
              <button
                type="button"
                onClick={() => setVistaActiva("calendario")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  vistaActiva === "calendario"
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Calendario
              </button>
            </div>
          </div>
        </div>

        {vistaActiva === "calendario" ? (
          <InteractiveCalendar
            events={calendarEvents}
            onSelectEvent={(event) => setCitaCalendario(event.resource)}
            selectable={false}
          />
        ) : citasFiltradas.length > 0 ? (
          <div className="space-y-5">
            {citasFiltradas.map((cita) => (
              <article
                key={cita.id}
                className="admin-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-[92px] w-[92px] shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                      <span className="text-stat-sm leading-none">{cita.fechaCorta}</span>

                      <span className="mt-2 text-xs font-semibold">{cita.dia}</span>
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
                        <DetailItem
                          icon={<ClipboardList className="h-[18px] w-[18px]" />}
                          text={cita.servicio}
                        />

                        <DetailItem
                          icon={<Clock className="h-[18px] w-[18px]" />}
                          text={cita.hora}
                        />

                        <DetailItem
                          icon={<User className="h-[18px] w-[18px]" />}
                          text={cita.veterinario}
                        />
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

      {/* Modal de detalle — vista calendario */}
      <AppointmentDetailModal
        isOpen={!!citaCalendario}
        onClose={() => setCitaCalendario(null)}
        appointment={citaCalendario}
        onCancel={(appointment) => {
          setCitaCalendario(null);
          cancelarCita(appointment.id);
        }}
      />
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
      className="fixed inset-0 z-[120] flex items-center justify-center bg-surface-900/50 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-detalle-cita"
        onClick={(event) => event.stopPropagation()}
        className="max-h-full w-full max-w-[680px] overflow-y-auto rounded-3xl border border-surface-200/60 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-7 py-6 dark:border-slate-700">
          <div className="flex items-start gap-4">
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <CalendarDays className="h-[25px] w-[25px]" />
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
            <X className="h-[18px] w-[18px]" />
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
            <ModalInfoItem
              label="Fecha"
              value={cita.fecha}
              icon={<CalendarDays className="h-[19px] w-[19px]" />}
            />
            <ModalInfoItem
              label="Hora"
              value={cita.hora}
              icon={<Clock className="h-[18px] w-[18px]" />}
            />
            <ModalInfoItem
              label="Tipo de atención"
              value={cita.servicio}
              icon={<ClipboardList className="h-[18px] w-[18px]" />}
            />
            <ModalInfoItem
              label="Veterinario"
              value={cita.veterinario}
              icon={<User className="h-[18px] w-[18px]" />}
            />
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-label">Motivo de la cita</p>
            <p className="mt-2 text-sm leading-6 text-slate-900 dark:text-white">
              {cita.motivo || "Sin motivo registrado"}
            </p>
          </div>

          {cita.estado === "Pendiente" && (
            <div className="dark:bg-warning-950/30 mt-4 flex items-start gap-3 rounded-xl border border-warning-200 bg-warning-50 px-4 py-4 dark:border-warning-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning-600" />
              <p className="text-sm leading-6 text-warning-700 dark:text-warning-300">
                <strong>En revisión:</strong> tu solicitud fue recibida. La clínica la revisará y te
                confirmará el horario a la brevedad.
              </p>
            </div>
          )}

          {cita.estado === "Confirmada" && (
            <div className="dark:bg-success-950/30 mt-4 flex items-start gap-3 rounded-xl border border-success-200 bg-success-50 px-4 py-4 dark:border-success-800">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success-600" />
              <p className="text-sm leading-6 text-success-700 dark:text-success-300">
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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
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
      <span className="text-surface-500 dark:text-surface-400">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function ModalInfoItem({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
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
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
        <CalendarOff className="h-[31px] w-[31px]" />
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
