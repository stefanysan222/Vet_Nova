"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";


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

const CITAS_STORAGE_KEY = "vetnova_citas_cliente";

const citasIniciales: Cita[] = [
  {
    id: "cita-max",
    mascota: "Max",
    especie: "Perro · Golden Retriever",
    servicio: "Consulta general",
    fecha: "26 de mayo de 2026",
    fechaCorta: "26",
    dia: "MAY",
    hora: "09:00 AM",
    veterinario: "Dra. Laura Gómez",
    motivo: "Control general y revisión de peso.",
    estado: "Confirmada",
  },
  {
    id: "cita-luna",
    mascota: "Luna",
    especie: "Gato · Siamés",
    servicio: "Vacunación",
    fecha: "29 de mayo de 2026",
    fechaCorta: "29",
    dia: "MAY",
    hora: "03:30 PM",
    veterinario: "Dr. Carlos Ramírez",
    motivo: "Aplicación de vacuna pendiente.",
    estado: "Pendiente",
  },
];

export default function AgendarPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroCita>("todas");
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    try {
      const citasGuardadas = localStorage.getItem(CITAS_STORAGE_KEY);

      if (citasGuardadas) {
        const datos = JSON.parse(citasGuardadas) as Cita[];

        if (Array.isArray(datos) && datos.length > 0) {
          setCitas(datos);
        } else {
          setCitas(citasIniciales);
          localStorage.setItem(
            CITAS_STORAGE_KEY,
            JSON.stringify(citasIniciales)
          );
        }
      } else {
        setCitas(citasIniciales);
        localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(citasIniciales));
      }
    } catch {
      setCitas(citasIniciales);
      localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(citasIniciales));
    } finally {
      setCargado(true);
    }
  }, []);

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
        (filtro === "proximas" &&
          (cita.estado === "Pendiente" || cita.estado === "Confirmada")) ||
        (filtro === "confirmadas" && cita.estado === "Confirmada") ||
        (filtro === "canceladas" && cita.estado === "Cancelada");

      return coincideBusqueda && coincideFiltro;
    });
  }, [busqueda, citas, filtro]);

  const totalProximas = citas.filter(
    (cita) => cita.estado === "Pendiente" || cita.estado === "Confirmada"
  ).length;

  const totalConfirmadas = citas.filter(
    (cita) => cita.estado === "Confirmada"
  ).length;

  const totalPendientes = citas.filter(
    (cita) => cita.estado === "Pendiente"
  ).length;

  const guardarCitas = (citasActualizadas: Cita[]) => {
    setCitas(citasActualizadas);
    localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(citasActualizadas));
    window.dispatchEvent(new Event("vetnova-appointments-updated"));
  };

  const cancelarCita = (id: string) => {
    const citasActualizadas = citas.map((cita) =>
      cita.id === id ? { ...cita, estado: "Cancelada" as EstadoCita } : cita
    );

    guardarCitas(citasActualizadas);

    setCitaSeleccionada((actual) =>
      actual?.id === id
        ? { ...actual, estado: "Cancelada" as EstadoCita }
        : actual
    );
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltro("todas");
  };

  if (!cargado) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F5F7FB] dark:bg-[#0F172A]">
        <p className="text-[15px] text-[#64748B] dark:text-[#94A3B8]">
          Cargando citas...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
      {/* Encabezado */}
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-[24px] font-semibold leading-none text-[#10213A] dark:text-white">
            Mis citas
          </h1>

          <p className="mt-4 text-[16px] text-[#64748B] dark:text-[#94A3B8]">
            Consulta y administra las citas programadas para tus mascotas
          </p>
        </div>

        <Link
          href="/cliente/agendar/nueva"
          className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl bg-[#2F6BFF] px-5 text-[15px] font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2457D6] hover:shadow-[0_10px_20px_rgba(47,107,255,0.28)]"
        >
          <PlusIcon />
          Nueva cita
        </Link>
      </div>

      {/* Tarjetas de resumen */}
      <div className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-3">
        <SummaryCard
          title="Próximas citas"
          value={totalProximas}
          description="Citas por atender"
          icon={<CalendarIcon />}
        />

        <SummaryCard
          title="Confirmadas"
          value={totalConfirmadas}
          description="Horario confirmado"
          icon={<CalendarCheckIcon />}
        />

        <SummaryCard
          title="Pendientes"
          value={totalPendientes}
          description="En espera de confirmación"
          icon={<ClockIcon />}
        />
      </div>

      {/* Buscador y filtros */}
      <section className="mb-7 rounded-xl border border-[#CBD5E1] bg-white p-4 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex h-[46px] flex-1 items-center gap-3 rounded-xl border border-[#CBD5E1] bg-white px-4 transition-all focus-within:border-[#2F6BFF] focus-within:ring-2 focus-within:ring-[#2F6BFF]/10 dark:border-[#334155] dark:bg-[#0F172A]">
            <SearchIcon />

            <input
              type="text"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por mascota, servicio o veterinario..."
              className="w-full bg-transparent text-[15px] text-[#10213A] outline-none placeholder:text-[#94A3B8] dark:text-white"
            />

            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                aria-label="Limpiar búsqueda"
                className="text-[#94A3B8] transition-colors hover:text-[#2F6BFF]"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={filtro === "todas"}
              onClick={() => setFiltro("todas")}
            >
              Todas
            </FilterButton>

            <FilterButton
              active={filtro === "proximas"}
              onClick={() => setFiltro("proximas")}
            >
              Próximas
            </FilterButton>

            <FilterButton
              active={filtro === "confirmadas"}
              onClick={() => setFiltro("confirmadas")}
            >
              Confirmadas
            </FilterButton>

            <FilterButton
              active={filtro === "canceladas"}
              onClick={() => setFiltro("canceladas")}
            >
              Canceladas
            </FilterButton>
          </div>
        </div>
      </section>

      {/* Listado de citas */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-[#10213A] dark:text-white">
            Citas programadas
          </h2>

          <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
            {citasFiltradas.length}{" "}
            {citasFiltradas.length === 1 ? "resultado" : "resultados"}
          </p>
        </div>

        {citasFiltradas.length > 0 ? (
          <div className="space-y-5">
            {citasFiltradas.map((cita) => (
              <article
                key={cita.id}
                className="rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#2F6BFF]/50 hover:shadow-[0_12px_26px_rgba(15,23,42,0.08)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF]"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-[92px] w-[92px] shrink-0 flex-col items-center justify-center rounded-xl bg-[#E9F1FF] text-[#2F6BFF] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
                      <span className="text-[28px] font-bold leading-none">
                        {cita.fechaCorta}
                      </span>

                      <span className="mt-2 text-[12px] font-semibold">
                        {cita.dia}
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
                          {cita.mascota}
                        </h3>

                        <StatusBadge estado={cita.estado} />
                      </div>

                      <p className="mt-3 text-[15px] text-[#52698A] dark:text-[#94A3B8]">
                        {cita.especie}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3 text-[14px] text-[#52698A] dark:text-[#94A3B8]">
                        <DetailItem
                          icon={<MedicalIcon />}
                          text={cita.servicio}
                        />

                        <DetailItem
                          icon={<ClockSmallIcon />}
                          text={cita.hora}
                        />

                        <DetailItem
                          icon={<UserIcon />}
                          text={cita.veterinario}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-[#E2E8F0] pt-5 sm:flex-row xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0 dark:border-[#334155]">
                    <button
                      type="button"
                      onClick={() => setCitaSeleccionada(cita)}
                      className="inline-flex h-[48px] items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-6 text-[14px] font-semibold text-[#10213A] transition-all hover:border-[#2F6BFF] hover:text-[#2F6BFF] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:hover:border-[#2F6BFF] dark:hover:text-[#60A5FA]"
                    >
                      Ver detalle
                    </button>

                    {cita.estado !== "Cancelada" &&
                      cita.estado !== "Completada" && (
                        <button
                          type="button"
                          onClick={() => cancelarCita(cita.id)}
                          className="inline-flex h-[48px] items-center justify-center rounded-xl border border-[#F1CDD1] bg-white px-6 text-[14px] font-semibold text-[#DC3545] transition-all hover:bg-[#FFF2F3] dark:border-[#67333B] dark:bg-[#0F172A] dark:hover:bg-[#28171B]"
                        >
                          Cancelar cita
                        </button>
                      )}
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-[#F8FAFD] px-4 py-4 text-[14px] text-[#52698A] dark:bg-[#0F172A] dark:text-[#94A3B8]">
                  <span className="font-semibold text-[#10213A] dark:text-white">
                    Motivo:
                  </span>{" "}
                  {cita.motivo}
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
        className="max-h-full w-full max-w-[680px] overflow-y-auto rounded-2xl border border-[#CBD5E1] bg-white shadow-[0_22px_55px_rgba(15,23,42,0.30)] dark:border-[#334155] dark:bg-[#111827]"
      >
        <div className="flex items-start justify-between border-b border-[#E2E8F0] px-7 py-6 dark:border-[#334155]">
          <div className="flex items-start gap-4">
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
              <CalendarIcon />
            </div>

            <div>
              <h2
                id="titulo-detalle-cita"
                className="text-[21px] font-semibold text-[#10213A] dark:text-white"
              >
                Detalle de la cita
              </h2>

              <p className="mt-1 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                Información completa de la atención programada
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#10213A] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-7 py-6">
          <div className="flex flex-col justify-between gap-4 rounded-xl bg-[#F5F7FB] p-5 sm:flex-row sm:items-center dark:bg-[#0F172A]">
            <div>
              <p className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                Mascota
              </p>

              <h3 className="mt-2 text-[22px] font-semibold text-[#10213A] dark:text-white">
                {cita.mascota}
              </h3>

              <p className="mt-2 text-[14px] text-[#52698A] dark:text-[#94A3B8]">
                {cita.especie}
              </p>
            </div>

            <StatusBadge estado={cita.estado} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ModalInfoItem
              label="Fecha"
              value={cita.fecha}
              icon={<CalendarSmallIcon />}
            />

            <ModalInfoItem
              label="Hora"
              value={cita.hora}
              icon={<ClockSmallIcon />}
            />

            <ModalInfoItem
              label="Tipo de atención"
              value={cita.servicio}
              icon={<MedicalIcon />}
            />

            <ModalInfoItem
              label="Veterinario"
              value={cita.veterinario}
              icon={<UserIcon />}
            />
          </div>

          <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 dark:border-[#334155] dark:bg-[#0F172A]">
            <p className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              Motivo de la cita
            </p>

            <p className="mt-3 text-[15px] leading-6 text-[#10213A] dark:text-white">
              {cita.motivo}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#E2E8F0] px-7 py-5 sm:flex-row dark:border-[#334155]">
          {cita.estado !== "Cancelada" &&
            cita.estado !== "Completada" && (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-[45px] items-center justify-center rounded-xl border border-[#F1CDD1] bg-white px-6 text-[15px] font-semibold text-[#DC3545] transition-all hover:bg-[#FFF2F3] dark:border-[#67333B] dark:bg-[#0F172A] dark:hover:bg-[#28171B]"
              >
                Cancelar cita
              </button>
            )}

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[45px] items-center justify-center rounded-xl bg-[#2F6BFF] px-7 text-[15px] font-semibold text-white transition-all hover:bg-[#2457D6]"
          >
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
}: {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
}) {
  return (
    <article className="rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[14px] font-medium text-[#64748B] dark:text-[#94A3B8]">
            {title}
          </p>

          <p className="mt-3 text-[30px] font-semibold leading-none text-[#10213A] dark:text-white">
            {value}
          </p>

          <p className="mt-3 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
            {description}
          </p>
        </div>

        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
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
      className={`h-[42px] rounded-xl px-4 text-[14px] font-semibold transition-all ${
        active
          ? "bg-[#2F6BFF] text-white"
          : "border border-[#CBD5E1] bg-white text-[#52698A] hover:border-[#2F6BFF] hover:text-[#2F6BFF] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#94A3B8] dark:hover:border-[#2F6BFF] dark:hover:text-[#60A5FA]"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ estado }: { estado: EstadoCita }) {
  const estilos: Record<EstadoCita, string> = {
    Confirmada:
      "bg-[#DDF5DE] text-[#008B35] dark:bg-[#123B22] dark:text-[#86EFAC]",
    Pendiente:
      "bg-[#FFF1CC] text-[#9A6700] dark:bg-[#4A3412] dark:text-[#FACC15]",
    Completada:
      "bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]",
    Cancelada:
      "bg-[#FFE1E4] text-[#DC3545] dark:bg-[#432027] dark:text-[#FDA4AF]",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-[5px] text-[12px] font-semibold leading-none ${estilos[estado]}`}
    >
      {estado}
    </span>
  );
}

function DetailItem({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#52698A] dark:text-[#94A3B8]">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function ModalInfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] p-4 dark:border-[#334155]">
      <div className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
        {icon}
      </div>

      <div>
        <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
          {label}
        </p>

        <p className="mt-1 text-[14px] font-semibold text-[#10213A] dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex min-h-[285px] flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-white px-6 text-center shadow-sm dark:border-[#334155] dark:bg-[#111827]">
      <div className="mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
        <CalendarEmptyIcon />
      </div>

      <h3 className="text-[19px] font-semibold text-[#10213A] dark:text-white">
        No se encontraron citas
      </h3>

      <p className="mt-3 max-w-[400px] text-[14px] leading-6 text-[#64748B] dark:text-[#94A3B8]">
        No hay citas que coincidan con la búsqueda o con el filtro
        seleccionado.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex h-[44px] items-center rounded-xl border border-[#CBD5E1] bg-white px-5 text-[14px] font-semibold text-[#10213A] transition-all hover:border-[#2F6BFF] hover:text-[#2F6BFF] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:hover:border-[#2F6BFF] dark:hover:text-[#60A5FA]"
      >
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
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
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
      <path
        d="M9 14.5h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7v5l3.5 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockSmallIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7v5l3.5 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
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