"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  Heart,
  Lock,
  CalendarDays,
  CheckCircle2,
  History,
  Pill,
  PawPrint,
  Search,
  Clock,
  ClipboardList,
  User,
  Plus,
  X,
  type LucideIcon,
} from "lucide-react";
import { SkeletonStats, SkeletonCardList } from "../../components/ui/Skeleton";
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
      // Sincronizar el filtro local con el query param "buscar" de la URL
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBusqueda(pacienteBuscadoDesdeBarra);
      setFiltro("Todos");
    }
  }, [pacienteBuscadoDesdeBarra]);

  useEffect(() => {
    Promise.all([fetchMascotas(), fetchCitas()])
      .then(([pets, citas]) => {
        setPacientes(pets.map((p) => petRecordToPaciente(p, citas)));
      })
      .catch(() =>
        setError("No se pudo cargar los pacientes. Verifica la conexión con el servidor."),
      )
      .finally(() => setLoading(false));
  }, []);

  const pacientesFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda.trim());
    return pacientes.filter((paciente) => {
      const informacion = normalizarTexto(
        `${paciente.nombre} ${paciente.propietario} ${paciente.especie} ${paciente.raza} ${paciente.estado}`,
      );
      const coincideBusqueda = !texto || informacion.includes(texto);
      const coincideEstado = filtro === "Todos" || paciente.estado === filtro;
      return coincideBusqueda && coincideEstado;
    });
  }, [busqueda, filtro, pacientes]);

  const porAtender = pacientes.filter((p) => p.estado === "Por atender").length;
  const atendidosHoy = pacientes.filter((p) => p.estado === "Atendido hoy").length;
  const enSeguimiento = pacientes.filter(
    (p) => p.estado === "En seguimiento" || p.estado === "Control programado",
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
      <header className="overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-600 to-brand-700 p-7 text-white shadow-brand dark:border-brand-900/40 dark:from-brand-800 dark:to-brand-950 dark:shadow-brand-sm">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-200">
              Pacientes
            </p>

            <h1 className="text-display">Pacientes asignados y atendidos</h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-100">
              Consulta la información clínica de tus pacientes, revisa antecedentes y registra el
              seguimiento correspondiente a cada tratamiento.
            </p>
          </div>

          <div className="flex min-w-[252px] items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
              <Heart className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-medium text-brand-100">Seguimiento clínico</p>

              <p className="mt-1 text-sm font-semibold text-white">
                {enSeguimiento + tratamientosActivos} pacientes activos
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
          <Lock className="mt-0.5 h-[17px] w-[17px] shrink-0 text-brand-100" />

          <p className="text-sm leading-6 text-brand-100">
            El veterinario puede consultar y actualizar información clínica, pero no registrar,
            eliminar ni editar los datos generales de la mascota.
          </p>
        </div>
      </header>

      {/* ERROR */}
      {error && (
        <div className="dark:bg-danger-950/30 rounded-2xl border border-danger-200 bg-danger-50 px-5 py-4 dark:border-danger-800">
          <p className="text-sm text-danger-700 dark:text-danger-400">{error}</p>
        </div>
      )}

      {/* INDICADORES */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TarjetaIndicador
          titulo="Por atender hoy"
          valor={porAtender}
          descripcion="Pacientes con consulta pendiente"
          icono={CalendarDays}
          color="blue"
        />
        <TarjetaIndicador
          titulo="Atendidos hoy"
          valor={atendidosHoy}
          descripcion="Consultas finalizadas"
          icono={CheckCircle2}
          color="green"
        />
        <TarjetaIndicador
          titulo="En seguimiento"
          valor={enSeguimiento}
          descripcion="Controles y evoluciones"
          icono={History}
          color="purple"
        />
        <TarjetaIndicador
          titulo="Tratamientos activos"
          valor={tratamientosActivos}
          descripcion="Pacientes medicados"
          icono={Pill}
          color="red"
        />
      </section>

      {/* LISTA */}
      <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-700 dark:bg-surface-900">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
              <PawPrint className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-section-title">Pacientes clínicos</h2>

              <p className="text-subtitle mt-1">Selecciona un paciente para revisar su atención.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="group relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 transition group-focus-within:text-brand-600">
                <Search className="h-[18px] w-[18px]" />
              </span>

              <input
                type="text"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar paciente..."
                className="form-input pl-11 sm:w-[250px]"
              />
            </div>

            <select
              value={filtro}
              onChange={(event) => setFiltro(event.target.value as FiltroEstado)}
              className="form-input cursor-pointer font-medium"
            >
              {opcionesFiltro.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-surface-500 dark:text-surface-400">Resultados encontrados</p>

          <div className="flex items-center gap-3">
            {(busqueda || filtro !== "Todos") && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="text-sm font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
              >
                Limpiar filtros
              </button>
            )}

            <span className="rounded-lg bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
              {pacientesFiltrados.length} pacientes
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {pacientesFiltrados.map((paciente) => (
            <article
              key={paciente.id}
              className="group relative overflow-hidden rounded-2xl border border-surface-200 bg-surface-50 p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-950"
            >
              <div className="absolute left-0 top-0 h-full w-1 origin-bottom scale-y-0 bg-brand-500 transition duration-300 group-hover:scale-y-100" />

              <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
                <div className="flex items-start gap-4">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-lg font-bold text-brand-600 transition duration-300 group-hover:-translate-y-1 dark:bg-brand-900/40 dark:text-brand-300">
                    {paciente.nombre.charAt(0)}

                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white dark:border-surface-950 dark:bg-surface-950">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${colorPuntoEstado(paciente.estado)}`}
                      />
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-semibold text-surface-900 transition group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">
                        {paciente.nombre} · {paciente.especie}
                      </p>

                      <EstadoBadge estado={paciente.estado} />
                    </div>

                    <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
                      {paciente.raza} · Propietario: {paciente.propietario}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-surface-500 dark:text-surface-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {paciente.ultimaAtencion}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <ClipboardList className="h-4 w-4" />
                        {paciente.motivo}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPacientePerfil(paciente)}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-surface-300 bg-white px-4 text-xs font-semibold text-surface-600 transition hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300"
                  >
                    <User className="h-4 w-4" />
                    Ver perfil
                  </button>

                  <Link
                    href={`/veterinario/historial?paciente=${paciente.id}`}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white px-4 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 dark:border-surface-700 dark:bg-surface-900 dark:text-brand-300 dark:hover:bg-brand-950/30"
                  >
                    <History className="h-4 w-4" />
                    Historial
                  </Link>

                  {paciente.estado === "Por atender" && (
                    <Link
                      href={`/veterinario/consulta?paciente=${paciente.id}`}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-xs font-semibold text-white transition hover:bg-brand-700"
                    >
                      <Plus className="h-4 w-4" />
                      Registrar consulta
                    </Link>
                  )}

                  {(paciente.estado === "Tratamiento activo" ||
                    paciente.estado === "En seguimiento" ||
                    paciente.estado === "Control programado") && (
                    <Link
                      href={`/veterinario/historial?paciente=${paciente.id}&accion=evolucion`}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-xs font-semibold text-white transition hover:bg-brand-700"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar evolución
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}

          {pacientesFiltrados.length === 0 && !loading && (
            <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 px-5 py-14 text-center dark:border-surface-700 dark:bg-surface-950">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                <Search className="h-7 w-7" />
              </div>

              <p className="mt-4 text-sm font-semibold text-surface-900 dark:text-white">
                No se encontraron pacientes
              </p>

              <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
                Intenta modificar la búsqueda o el estado seleccionado.
              </p>

              <button
                type="button"
                onClick={limpiarFiltros}
                className="mt-5 rounded-xl bg-brand-600 px-5 py-3 text-xs font-semibold text-white transition hover:bg-brand-700"
              >
                Mostrar todos
              </button>
            </div>
          )}
        </div>
      </section>

      {/* MODAL PERFIL */}
      {pacientePerfil && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 px-4 py-6 backdrop-blur-sm">
          <section className="max-h-[94vh] w-full max-w-[740px] overflow-y-auto rounded-3xl border border-surface-200/60 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900">
            <div className="border-b border-surface-100 px-6 py-6 dark:border-surface-800">
              <div className="flex items-start justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-lg font-bold text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                    {pacientePerfil.nombre.charAt(0)}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
                      Perfil clínico
                    </p>

                    <h2 className="text-page-title mt-2">{pacientePerfil.nombre}</h2>

                    <p className="text-subtitle mt-1">
                      {pacientePerfil.especie} · {pacientePerfil.raza}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPacientePerfil(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-surface-500 transition hover:bg-surface-100 dark:hover:bg-surface-800"
                  aria-label="Cerrar perfil"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-800 dark:bg-brand-950/30 dark:text-brand-300">
                <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="leading-6">
                  Información de solo consulta. Los datos generales son administrados por el
                  propietario o el administrador.
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

              <div className="rounded-2xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-950">
                <p className="text-sm font-semibold text-surface-900 dark:text-white">
                  Antecedentes relevantes
                </p>

                <p className="mt-3 text-sm leading-6 text-surface-500 dark:text-surface-400">
                  {pacientePerfil.antecedentes}
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Link
                  href={`/veterinario/historial?paciente=${pacientePerfil.id}`}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-200 px-5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 dark:border-surface-700 dark:text-brand-300 dark:hover:bg-brand-950/30"
                >
                  <History className="h-4 w-4" />
                  Ver historial clínico
                </Link>

                <Link
                  href={`/veterinario/historial?paciente=${pacientePerfil.id}&accion=evolucion`}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  <Plus className="h-4 w-4" />
                  Agregar evolución
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function CargandoPacientes() {
  return (
    <div className="space-y-6">
      <SkeletonStats count={4} />
      <SkeletonCardList count={6} />
    </div>
  );
}

function TarjetaIndicador({
  titulo,
  valor,
  descripcion,
  icono,
  color,
}: {
  titulo: string;
  valor: number;
  descripcion: string;
  icono: LucideIcon;
  color: "blue" | "green" | "purple" | "red";
}) {
  const estilos = {
    blue: {
      icono: "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300",
      linea: "bg-brand-500",
    },
    green: {
      icono: "bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300",
      linea: "bg-success-500",
    },
    purple: {
      icono: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
      linea: "bg-brand-700",
    },
    red: {
      icono: "bg-danger-100 text-danger-600 dark:bg-danger-900/40 dark:text-danger-300",
      linea: "bg-danger-500",
    },
  };

  const Icono = icono;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-surface-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-900">
      <span className={`absolute left-0 top-0 h-full w-1 ${estilos[color].linea}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-label">{titulo}</p>
          <p className="text-stat mt-3">{valor}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${estilos[color].icono}`}
        >
          <Icono className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">{descripcion}</p>
    </article>
  );
}

function DatoPerfil({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-xl border border-transparent bg-surface-50 px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50/40 dark:bg-surface-950 dark:hover:border-surface-700 dark:hover:bg-surface-900">
      <p className="text-caption">{titulo}</p>
      <p className="mt-2 text-sm font-medium text-surface-900 dark:text-white">{valor}</p>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: EstadoPaciente }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-semibold ${estiloEstado(estado)}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${colorPuntoEstado(estado)} ${estado === "Por atender" || estado === "Tratamiento activo" ? "animate-pulse" : ""}`}
      />
      {estado}
    </span>
  );
}

function estiloEstado(estado: EstadoPaciente) {
  switch (estado) {
    case "Por atender":
      return "bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300";
    case "Atendido hoy":
      return "bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300";
    case "En seguimiento":
      return "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300";
    case "Tratamiento activo":
      return "bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300";
    case "Control programado":
      return "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300";
  }
}

function colorPuntoEstado(estado: EstadoPaciente) {
  switch (estado) {
    case "Por atender":
      return "bg-warning-500";
    case "Atendido hoy":
      return "bg-success-500";
    case "En seguimiento":
      return "bg-brand-500";
    case "Tratamiento activo":
      return "bg-danger-500";
    case "Control programado":
      return "bg-brand-700";
  }
}

function normalizarTexto(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
