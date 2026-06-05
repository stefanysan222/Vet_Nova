"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { fetchMascotas } from "../../../lib/api/mascotas";
import { fetchCitas } from "../../../lib/api/citas";
import type { PetRecord, Appointment } from "../../../lib/recepcionista/types";

type EstadoPaciente =
  | "Por atender"
  | "Atendido hoy"
  | "En seguimiento"
  | "Tratamiento activo"
  | "Control programado";

type FiltroEstado = "Todos" | EstadoPaciente;

interface Paciente {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  edad: string;
  peso: string;
  propietario: string;
  ultimaAtencion: string;
  motivo: string;
  estado: EstadoPaciente;
  alergias: string;
  antecedentes: string;
}

function fechaHoy(): string {
  return new Date().toISOString().slice(0, 10);
}

function derivarEstado(citas: Appointment[], mascotaId: string): EstadoPaciente {
  const propias = citas.filter((c) => c.petId === mascotaId);
  if (propias.length === 0) return "Control programado";

  const hoy = fechaHoy();
  const hoyConf = propias.find((c) => c.date === hoy && c.status === "Confirmada");
  if (hoyConf) return "Por atender";

  const hoyFin = propias.find((c) => c.date === hoy && c.status === "Finalizada");
  if (hoyFin) return "Atendido hoy";

  const enAtencion = propias.find((c) => c.status === "En atención" || c.status === "En espera");
  if (enAtencion) return "Tratamiento activo";

  const pendiente = propias.find((c) => c.status === "Pendiente" || c.status === "Confirmada");
  if (pendiente) return "En seguimiento";

  return "Control programado";
}

function ultimaAtencionStr(citas: Appointment[], mascotaId: string): string {
  const propias = citas
    .filter((c) => c.petId === mascotaId && c.date)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (propias.length === 0) return "Sin atenciones";
  const ultima = propias[0];
  const hoy = fechaHoy();
  const label = ultima.date === hoy ? "Hoy" : ultima.date;
  return ultima.time ? `${label} · ${ultima.time}` : label;
}

function motivoPrincipal(citas: Appointment[], mascotaId: string): string {
  const propias = citas
    .filter((c) => c.petId === mascotaId && c.date)
    .sort((a, b) => b.date.localeCompare(a.date));
  return propias[0]?.service ?? "Sin citas registradas";
}

function petRecordToPaciente(pet: PetRecord, citas: Appointment[]): Paciente {
  return {
    id: pet.id,
    nombre: pet.nombre,
    especie: pet.especie,
    raza: pet.raza,
    edad: pet.edad,
    peso: pet.peso,
    propietario: pet.propietarioNombre,
    ultimaAtencion: ultimaAtencionStr(citas, pet.id),
    motivo: motivoPrincipal(citas, pet.id),
    estado: derivarEstado(citas, pet.id),
    alergias: "No registradas",
    antecedentes: "Sin antecedentes registrados.",
  };
}

const opcionesFiltro: FiltroEstado[] = [
  "Todos",
  "Por atender",
  "Atendido hoy",
  "En seguimiento",
  "Tratamiento activo",
  "Control programado",
];

export default function VeterinarioMascotasPage() {
  return (
    <Suspense fallback={<CargandoPacientes />}>
      <PacientesContent />
    </Suspense>
  );
}

function PacientesContent() {
  const searchParams = useSearchParams();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroEstado>("Todos");
  const [pacientePerfil, setPacientePerfil] = useState<Paciente | null>(null);

  const pacienteBuscadoDesdeBarra = searchParams.get("buscar") ?? "";

  useEffect(() => {
    if (pacienteBuscadoDesdeBarra) {
      setBusqueda(pacienteBuscadoDesdeBarra);
      setFiltro("Todos");
    }
  }, [pacienteBuscadoDesdeBarra]);

  useEffect(() => {
    Promise.all([fetchMascotas(), fetchCitas()])
      .then(([pets, citas]) => {
        setPacientes(pets.map((p) => petRecordToPaciente(p, citas)));
      })
      .catch(() => setError("No se pudo cargar los pacientes. Verifica la conexión con el servidor."))
      .finally(() => setLoading(false));
  }, []);

  const pacientesFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda.trim());
    return pacientes.filter((paciente) => {
      const informacion = normalizarTexto(
        `${paciente.nombre} ${paciente.propietario} ${paciente.especie} ${paciente.raza} ${paciente.estado}`
      );
      const coincideBusqueda = !texto || informacion.includes(texto);
      const coincideEstado = filtro === "Todos" || paciente.estado === filtro;
      return coincideBusqueda && coincideEstado;
    });
  }, [busqueda, filtro, pacientes]);

  const porAtender = pacientes.filter((p) => p.estado === "Por atender").length;
  const atendidosHoy = pacientes.filter((p) => p.estado === "Atendido hoy").length;
  const enSeguimiento = pacientes.filter(
    (p) => p.estado === "En seguimiento" || p.estado === "Control programado"
  ).length;
  const tratamientosActivos = pacientes.filter((p) => p.estado === "Tratamiento activo").length;

  function limpiarFiltros() {
    setBusqueda("");
    setFiltro("Todos");
  }

  if (loading) return <CargandoPacientes />;

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <header className="patient-header relative overflow-hidden rounded-[28px] border border-[#D9E6FF] bg-gradient-to-r from-[#F7FAFF] via-white to-[#EEF6FF] p-7 shadow-[0_16px_38px_rgba(37,99,235,0.08)] dark:border-[#233552] dark:from-[#111827] dark:via-[#111827] dark:to-[#12213A]">
        <div className="patient-orb absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#DBEAFE]/70 blur-3xl dark:bg-[#2563EB]/20" />

        <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="patient-pulse relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-70" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#2563EB]" />
              </span>

              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2563EB] dark:text-[#93C5FD]">
                Pacientes
              </p>
            </div>

            <h1 className="text-[32px] font-bold leading-tight text-[#10213A] dark:text-white">
              Pacientes asignados y atendidos
            </h1>

            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#64748B] dark:text-[#94A3B8]">
              Consulta la información clínica de tus pacientes, revisa
              antecedentes y registra el seguimiento correspondiente a cada
              tratamiento.
            </p>
          </div>

          <div className="patient-floating flex min-w-[252px] items-center gap-4 rounded-[20px] border border-white/90 bg-white/80 px-5 py-4 shadow-[0_12px_32px_rgba(37,99,235,0.10)] backdrop-blur-sm dark:border-[#334155] dark:bg-[#0F172A]/80">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F0FF] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]">
              <PatientIcon name="heart" />
            </div>

            <div>
              <p className="text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                Seguimiento clínico
              </p>

              <p className="mt-1 text-[16px] font-semibold text-[#10213A] dark:text-white">
                {enSeguimiento + tratamientosActivos} pacientes activos
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-6 flex items-start gap-3 rounded-[15px] border border-[#D9E7FF] bg-white/75 px-4 py-3 backdrop-blur-sm dark:border-[#29406B] dark:bg-[#172554]/40">
          <PatientIcon
            name="lock"
            className="mt-0.5 h-[17px] w-[17px] shrink-0 text-[#2563EB]"
          />

          <p className="text-[13px] leading-6 text-[#1D4ED8] dark:text-[#BFDBFE]">
            El veterinario puede consultar y actualizar información clínica,
            pero no registrar, eliminar ni editar los datos generales de la
            mascota.
          </p>
        </div>
      </header>

      {/* ERROR */}
      {error && (
        <div className="rounded-[16px] border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 dark:border-[#7F1D1D] dark:bg-[#450A0A]">
          <p className="text-[14px] text-[#B91C1C] dark:text-[#FECACA]">{error}</p>
        </div>
      )}

      {/* INDICADORES */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TarjetaIndicador titulo="Por atender hoy" valor={porAtender} descripcion="Pacientes con consulta pendiente" icono="calendar" color="blue" delay="80ms" />
        <TarjetaIndicador titulo="Atendidos hoy" valor={atendidosHoy} descripcion="Consultas finalizadas" icono="check" color="green" delay="150ms" />
        <TarjetaIndicador titulo="En seguimiento" valor={enSeguimiento} descripcion="Controles y evoluciones" icono="history" color="purple" delay="220ms" />
        <TarjetaIndicador titulo="Tratamientos activos" valor={tratamientosActivos} descripcion="Pacientes medicados" icono="medicine" color="red" delay="290ms" />
      </section>

      {/* LISTA */}
      <section className="patient-section rounded-[24px] border border-[#D9E2EF] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-[#334155] dark:bg-[#111827]">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]">
              <PatientIcon name="patients" />
            </div>

            <div>
              <h2 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
                Pacientes clínicos
              </h2>

              <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
                Selecciona un paciente para revisar su atención.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="group relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition group-focus-within:text-[#2563EB]">
                <PatientIcon name="search" className="h-[18px] w-[18px]" />
              </span>

              <input
                type="text"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar paciente..."
                className="h-[48px] w-full rounded-xl border border-[#CBD5E1] bg-white pl-11 pr-4 text-[14px] text-[#10213A] outline-none transition duration-300 focus:border-[#2F6BFF] focus:shadow-[0_0_0_4px_rgba(47,107,255,0.10)] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white sm:w-[250px]"
              />
            </div>

            <select
              value={filtro}
              onChange={(event) => setFiltro(event.target.value as FiltroEstado)}
              className="h-[48px] cursor-pointer rounded-xl border border-[#CBD5E1] bg-white px-4 text-[14px] font-medium text-[#10213A] outline-none transition focus:border-[#2F6BFF] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            >
              {opcionesFiltro.map((opcion) => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">Resultados encontrados</p>

          <div className="flex items-center gap-3">
            {(busqueda || filtro !== "Todos") && (
              <button type="button" onClick={limpiarFiltros} className="text-[13px] font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]">
                Limpiar filtros
              </button>
            )}

            <span className="rounded-full bg-[#EEF4FF] px-4 py-2 text-[13px] font-semibold text-[#2563EB] dark:bg-[#1E293B] dark:text-[#93C5FD]">
              {pacientesFiltrados.length} pacientes
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {pacientesFiltrados.map((paciente, index) => (
            <article
              key={paciente.id}
              className="patient-card group relative overflow-hidden rounded-[20px] border border-[#E5EAF2] bg-[#FBFCFF] p-5 dark:border-[#334155] dark:bg-[#0F172A]"
              style={{ "--delay": `${index * 70}ms` } as CSSProperties}
            >
              <div className="absolute left-0 top-0 h-full w-1 origin-bottom scale-y-0 bg-[#2F6BFF] transition duration-300 group-hover:scale-y-100" />

              <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
                <div className="flex items-start gap-4">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#DBEAFE] to-[#EFF6FF] text-[20px] font-bold text-[#2563EB] transition duration-300 group-hover:-translate-y-1 dark:from-[#1E3A8A] dark:to-[#172554] dark:text-[#BFDBFE]">
                    {paciente.nombre.charAt(0)}

                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white dark:border-[#0F172A] dark:bg-[#0F172A]">
                      <span className={`h-2.5 w-2.5 rounded-full ${colorPuntoEstado(paciente.estado)}`} />
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[16px] font-semibold text-[#10213A] transition group-hover:text-[#2563EB] dark:text-white dark:group-hover:text-[#93C5FD]">
                        {paciente.nombre} · {paciente.especie}
                      </p>

                      <EstadoBadge estado={paciente.estado} />
                    </div>

                    <p className="mt-2 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                      {paciente.raza} · Propietario: {paciente.propietario}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                      <span className="flex items-center gap-1.5">
                        <PatientIcon name="clock" className="h-4 w-4" />
                        {paciente.ultimaAtencion}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <PatientIcon name="clipboard" className="h-4 w-4" />
                        {paciente.motivo}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPacientePerfil(paciente)}
                    className="patient-button-secondary flex h-[43px] items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#475569] dark:border-[#334155] dark:bg-[#111827] dark:text-[#CBD5E1]"
                  >
                    <PatientIcon name="profile" className="h-4 w-4" />
                    Ver perfil
                  </button>

                  <Link
                    href={`/veterinario/historial?paciente=${paciente.id}`}
                    className="patient-button-secondary flex h-[43px] items-center justify-center gap-2 rounded-xl border border-[#D6E3FF] bg-white px-4 text-[13px] font-semibold text-[#2563EB] dark:border-[#334155] dark:bg-[#111827] dark:text-[#93C5FD]"
                  >
                    <PatientIcon name="history" className="h-4 w-4" />
                    Historial
                  </Link>

                  {paciente.estado === "Por atender" && (
                    <Link
                      href={`/veterinario/consulta?paciente=${paciente.id}`}
                      className="patient-button-primary flex h-[43px] items-center justify-center gap-2 rounded-xl bg-[#2F6BFF] px-4 text-[13px] font-semibold text-white"
                    >
                      <PatientIcon name="plus" className="h-4 w-4" />
                      Registrar consulta
                    </Link>
                  )}

                  {(paciente.estado === "Tratamiento activo" ||
                    paciente.estado === "En seguimiento" ||
                    paciente.estado === "Control programado") && (
                    <Link
                      href={`/veterinario/historial?paciente=${paciente.id}&accion=evolucion`}
                      className="patient-button-primary flex h-[43px] items-center justify-center gap-2 rounded-xl bg-[#2F6BFF] px-4 text-[13px] font-semibold text-white"
                    >
                      <PatientIcon name="plus" className="h-4 w-4" />
                      Agregar evolución
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}

          {pacientesFiltrados.length === 0 && !loading && (
            <div className="rounded-[20px] border border-dashed border-[#CBD5E1] bg-[#FBFCFF] px-5 py-14 text-center dark:border-[#334155] dark:bg-[#0F172A]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]">
                <PatientIcon name="search" className="h-7 w-7" />
              </div>

              <p className="mt-4 text-[16px] font-semibold text-[#10213A] dark:text-white">
                No se encontraron pacientes
              </p>

              <p className="mt-2 text-sm text-[#64748B] dark:text-[#94A3B8]">
                Intenta modificar la búsqueda o el estado seleccionado.
              </p>

              <button
                type="button"
                onClick={limpiarFiltros}
                className="mt-5 rounded-xl bg-[#2F6BFF] px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-[#2459DF]"
              >
                Mostrar todos
              </button>
            </div>
          )}
        </div>
      </section>

      {/* MODAL PERFIL */}
      {pacientePerfil && (
        <div className="patient-modal-bg fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/55 px-4 py-6 backdrop-blur-[2px]">
          <section className="patient-modal max-h-[94vh] w-full max-w-[740px] overflow-y-auto rounded-[26px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.30)] dark:bg-[#111827]">
            <div className="relative overflow-hidden border-b border-[#E2E8F0] px-6 py-6 dark:border-[#334155]">
              <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-[#DBEAFE]/60 blur-3xl dark:bg-[#2563EB]/20" />

              <div className="relative flex items-start justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#DBEAFE] text-[21px] font-bold text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]">
                    {pacientePerfil.nombre.charAt(0)}
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#2563EB] dark:text-[#93C5FD]">
                      Perfil clínico
                    </p>

                    <h2 className="mt-2 text-[25px] font-bold text-[#10213A] dark:text-white">
                      {pacientePerfil.nombre}
                    </h2>

                    <p className="mt-1 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                      {pacientePerfil.especie} · {pacientePerfil.raza}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPacientePerfil(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[25px] text-[#64748B] transition hover:rotate-90 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
                  aria-label="Cerrar perfil"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-start gap-3 rounded-[15px] border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-3 text-[13px] text-[#1D4ED8] dark:border-[#1E3A8A] dark:bg-[#172554] dark:text-[#BFDBFE]">
                <PatientIcon name="lock" className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="leading-6">
                  Información de solo consulta. Los datos generales son administrados por el propietario o el administrador.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DatoPerfil titulo="Edad" valor={pacientePerfil.edad || "No registrada"} />
                <DatoPerfil titulo="Peso" valor={pacientePerfil.peso || "No registrado"} />
                <DatoPerfil titulo="Propietario" valor={pacientePerfil.propietario} />
                <DatoPerfil titulo="Estado clínico" valor={pacientePerfil.estado} />
                <DatoPerfil titulo="Alergias" valor={pacientePerfil.alergias} />
                <DatoPerfil titulo="Última atención" valor={pacientePerfil.ultimaAtencion} />
              </div>

              <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FBFCFF] p-4 dark:border-[#334155] dark:bg-[#0F172A]">
                <p className="text-[13px] font-semibold text-[#334155] dark:text-[#CBD5E1]">
                  Antecedentes relevantes
                </p>

                <p className="mt-3 text-[14px] leading-6 text-[#64748B] dark:text-[#94A3B8]">
                  {pacientePerfil.antecedentes}
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Link
                  href={`/veterinario/historial?paciente=${pacientePerfil.id}`}
                  className="patient-button-secondary flex h-[46px] items-center justify-center gap-2 rounded-xl border border-[#D6E3FF] px-5 text-[14px] font-semibold text-[#2563EB] dark:border-[#334155] dark:text-[#93C5FD]"
                >
                  <PatientIcon name="history" className="h-4 w-4" />
                  Ver historial clínico
                </Link>

                <Link
                  href={`/veterinario/historial?paciente=${pacientePerfil.id}&accion=evolucion`}
                  className="patient-button-primary flex h-[46px] items-center justify-center gap-2 rounded-xl bg-[#2F6BFF] px-5 text-[14px] font-semibold text-white"
                >
                  <PatientIcon name="plus" className="h-4 w-4" />
                  Agregar evolución
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}

      <style jsx global>{`
        @keyframes patient-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes patient-orb-motion {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-12px, 10px) scale(1.07); }
        }
        @keyframes patient-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes patient-ring {
          0% { transform: scale(1); opacity: 0.65; }
          70% { transform: scale(2.15); opacity: 0; }
          100% { transform: scale(2.15); opacity: 0; }
        }
        @keyframes patient-modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes patient-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .patient-header { animation: patient-fade-up 0.5s ease-out both; }
        .patient-orb { animation: patient-orb-motion 8s ease-in-out infinite; }
        .patient-floating { animation: patient-float 4.5s ease-in-out infinite; }
        .patient-pulse span:first-child { animation: patient-ring 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .patient-stat { animation: patient-fade-up 0.48s ease-out both; transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; }
        .patient-stat:hover { transform: translateY(-5px); box-shadow: 0 18px 38px rgba(15, 23, 42, 0.09); border-color: #bfdbfe; }
        .patient-section { animation: patient-fade-up 0.5s ease-out 0.24s both; }
        .patient-card { opacity: 0; animation: patient-fade-up 0.48s ease-out var(--delay) forwards; transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; }
        .patient-card:hover { transform: translateY(-3px); border-color: #d6e3ff; box-shadow: 0 14px 30px rgba(15, 23, 42, 0.07); }
        .patient-button-primary { transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease; }
        .patient-button-primary:hover { transform: translateY(-2px); background: #2459df; box-shadow: 0 9px 18px rgba(47, 107, 255, 0.22); }
        .patient-button-secondary { transition: transform 0.22s ease, background 0.22s ease, border-color 0.22s ease; }
        .patient-button-secondary:hover { transform: translateY(-2px); background: #f5f9ff; border-color: #bfdbfe; }
        .dark .patient-button-secondary:hover { background: #1e293b; }
        .patient-modal-bg { animation: patient-backdrop-in 0.22s ease-out both; }
        .patient-modal { animation: patient-modal-in 0.3s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .patient-header, .patient-orb, .patient-floating, .patient-stat, .patient-section, .patient-card, .patient-modal-bg, .patient-modal, .patient-pulse span:first-child {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function CargandoPacientes() {
  return (
    <div className="flex min-h-[400px] items-center justify-center rounded-[24px] border border-[#E2E8F0] bg-white dark:border-[#334155] dark:bg-[#111827]">
      <p className="text-[14px] font-medium text-[#64748B] dark:text-[#94A3B8]">
        Cargando pacientes...
      </p>
    </div>
  );
}

function TarjetaIndicador({ titulo, valor, descripcion, icono, color, delay }: {
  titulo: string; valor: number; descripcion: string; icono: IconName; color: "blue" | "green" | "purple" | "red"; delay: string;
}) {
  const estilos = {
    blue: { icono: "bg-[#E8F0FF] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]", linea: "bg-[#2563EB]" },
    green: { icono: "bg-[#DCFCE7] text-[#15803D] dark:bg-[#14532D] dark:text-[#BBF7D0]", linea: "bg-[#22C55E]" },
    purple: { icono: "bg-[#EDE9FE] text-[#7C3AED] dark:bg-[#4C1D95] dark:text-[#DDD6FE]", linea: "bg-[#8B5CF6]" },
    red: { icono: "bg-[#FEE2E2] text-[#DC2626] dark:bg-[#7F1D1D] dark:text-[#FECACA]", linea: "bg-[#EF4444]" },
  };

  return (
    <article className="patient-stat relative overflow-hidden rounded-[20px] border border-[#D9E2EF] bg-white p-5 shadow-[0_7px_20px_rgba(15,23,42,0.05)] dark:border-[#334155] dark:bg-[#111827]" style={{ animationDelay: delay }}>
      <span className={`absolute left-0 top-0 h-full w-1 ${estilos[color].linea}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">{titulo}</p>
          <p className="mt-4 text-[34px] font-bold text-[#10213A] dark:text-white">{valor}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-[16px] ${estilos[color].icono}`}>
          <PatientIcon name={icono} />
        </div>
      </div>
      <p className="mt-3 text-[13px] text-[#64748B] dark:text-[#94A3B8]">{descripcion}</p>
    </article>
  );
}

function DatoPerfil({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-[15px] border border-transparent bg-[#F8FAFC] px-4 py-3 transition hover:border-[#DBEAFE] hover:bg-[#F5F9FF] dark:bg-[#0F172A] dark:hover:border-[#334155] dark:hover:bg-[#162033]">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">{titulo}</p>
      <p className="mt-2 text-[14px] font-medium text-[#10213A] dark:text-white">{valor}</p>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: EstadoPaciente }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold ${estiloEstado(estado)}`}>
      <span className={`h-2 w-2 rounded-full ${colorPuntoEstado(estado)} ${estado === "Por atender" || estado === "Tratamiento activo" ? "animate-pulse" : ""}`} />
      {estado}
    </span>
  );
}

function estiloEstado(estado: EstadoPaciente) {
  switch (estado) {
    case "Por atender": return "bg-[#FEF3C7] text-[#B45309] dark:bg-[#78350F] dark:text-[#FDE68A]";
    case "Atendido hoy": return "bg-[#DCFCE7] text-[#15803D] dark:bg-[#14532D] dark:text-[#BBF7D0]";
    case "En seguimiento": return "bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]";
    case "Tratamiento activo": return "bg-[#FEE2E2] text-[#B91C1C] dark:bg-[#7F1D1D] dark:text-[#FECACA]";
    case "Control programado": return "bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#4C1D95] dark:text-[#DDD6FE]";
  }
}

function colorPuntoEstado(estado: EstadoPaciente) {
  switch (estado) {
    case "Por atender": return "bg-[#F59E0B]";
    case "Atendido hoy": return "bg-[#22C55E]";
    case "En seguimiento": return "bg-[#3B82F6]";
    case "Tratamiento activo": return "bg-[#EF4444]";
    case "Control programado": return "bg-[#8B5CF6]";
  }
}

type IconName = "heart" | "lock" | "calendar" | "check" | "history" | "medicine" | "patients" | "search" | "clock" | "clipboard" | "profile" | "plus";

function PatientIcon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const svgProps = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "heart": return <svg {...svgProps}><path d="M20.5 8.8c0 5.3-8.5 10.2-8.5 10.2S3.5 14.1 3.5 8.8A4.5 4.5 0 0 1 12 6.7a4.5 4.5 0 0 1 8.5 2.1Z" /><path d="M7.8 12h2.3l1.2-2.4 1.6 4 1.2-2h2.2" /></svg>;
    case "lock": return <svg {...svgProps}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
    case "calendar": return <svg {...svgProps}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M7.5 3.5v3.5M16.5 3.5v3.5M3.5 9.5h17" /></svg>;
    case "check": return <svg {...svgProps}><circle cx="12" cy="12" r="9" /><path d="m8 12 2.6 2.7L16.5 9" /></svg>;
    case "history": return <svg {...svgProps}><path d="M12 7v5l3.5 2" /><path d="M20.5 12a8.5 8.5 0 1 1-2.7-6.2" /><path d="M20.5 4.5v5h-5" /></svg>;
    case "medicine": return <svg {...svgProps}><path d="M7 7.5 16.5 17a3.2 3.2 0 1 0 4.5-4.5L11.5 3A3.2 3.2 0 0 0 7 7.5Z" /><path d="m8.5 11.5 4-4" /></svg>;
    case "patients": return <svg {...svgProps}><ellipse cx="8" cy="7" rx="2" ry="2.6" /><ellipse cx="16" cy="7" rx="2" ry="2.6" /><ellipse cx="6.5" cy="13" rx="2" ry="2.6" /><ellipse cx="17.5" cy="13" rx="2" ry="2.6" /><path d="M12 18.6c2.2 0 3.8-1.3 3.8-3 0-1.8-1.6-2.9-3.3-2.9-.8 0-1.5.2-2.1.7-.5.3-1 .4-1.5.4-1.5 0-2.7 1-2.7 2.4 0 1.4 1.2 2.4 2.8 2.4H12Z" /></svg>;
    case "search": return <svg {...svgProps}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></svg>;
    case "clock": return <svg {...svgProps}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>;
    case "clipboard": return <svg {...svgProps}><path d="M9 4h6" /><path d="M9 3.5h6A1.5 1.5 0 0 1 16.5 5v1h-9V5A1.5 1.5 0 0 1 9 3.5Z" /><rect x="5" y="6" width="14" height="15" rx="2" /><path d="M9 11h6M9 15h6" /></svg>;
    case "profile": return <svg {...svgProps}><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M5 20c0-3.6 2.9-6 7-6s7 2.4 7 6" /></svg>;
    case "plus": return <svg {...svgProps}><path d="M12 5v14M5 12h14" /></svg>;
  }
}

function normalizarTexto(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
