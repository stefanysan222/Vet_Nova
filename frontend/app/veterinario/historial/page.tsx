"use client";

import Link from "next/link";
import {
  FormEvent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { fetchMascotas } from "../../../lib/api/mascotas";
import { fetchCitas, createCita } from "../../../lib/api/citas";
import type { PetRecord, Appointment } from "../../../lib/recepcionista/types";
import { getCurrentUser } from "../../../lib/auth";

type EstadoClinico =
  | "Por atender"
  | "Atendido hoy"
  | "En seguimiento"
  | "Tratamiento activo"
  | "Control programado";

type TipoRegistro =
  | "Consulta"
  | "Procedimiento"
  | "Vacunación"
  | "Control"
  | "Evolución clínica";

interface RegistroClinico {
  id: string;
  tipo: TipoRegistro;
  fecha: string;
  profesional: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  recomendaciones: string;
}

interface PacienteClinico {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  edad: string;
  peso: string;
  propietario: string;
  propietarioId: string;
  alergias: string;
  antecedentes: string;
  estado: EstadoClinico;
  tratamientoActual?: string;
  registros: RegistroClinico[];
}

interface FormularioEvolucion {
  evolucion: string;
  cambioTratamiento: string;
  recomendaciones: string;
  proximoControl: string;
  nuevoEstado: EstadoClinico;
}

function formularioInicial(): FormularioEvolucion {
  return { evolucion: "", cambioTratamiento: "", recomendaciones: "", proximoControl: "", nuevoEstado: "En seguimiento" };
}

function fechaHoy(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatearFecha(isoDate: string): string {
  if (!isoDate) return "—";
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function mapServicioToTipo(servicio: string): TipoRegistro {
  const s = (servicio ?? "").toLowerCase();
  if (s.includes("vacun")) return "Vacunación";
  if (s.includes("cirugía") || s.includes("proced")) return "Procedimiento";
  if (s.includes("control") || s.includes("post")) return "Control";
  if (s.includes("evolución") || s.includes("evolucion") || s.includes("seguimiento")) return "Evolución clínica";
  return "Consulta";
}

function parseNotas(raw: string | undefined): { diagnostico?: string; tratamiento?: string; recomendaciones?: string; tipo?: string } {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return { diagnostico: raw }; }
}

function derivarEstado(citas: Appointment[], mascotaId: string): EstadoClinico {
  const propias = citas.filter((c) => c.petId === mascotaId);
  if (propias.length === 0) return "Control programado";
  const hoy = fechaHoy();
  if (propias.find((c) => c.date === hoy && c.status === "Confirmada")) return "Por atender";
  if (propias.find((c) => c.date === hoy && c.status === "Finalizada")) return "Atendido hoy";
  if (propias.find((c) => c.status === "En atención" || c.status === "En espera")) return "Tratamiento activo";
  if (propias.find((c) => c.status === "Confirmada" || c.status === "Pendiente")) return "En seguimiento";
  return "Control programado";
}

function buildPacienteClinico(pet: PetRecord, citas: Appointment[]): PacienteClinico {
  const propias = citas
    .filter((c) => c.petId === pet.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const registros: RegistroClinico[] = propias
    .filter((c) => c.status === "Finalizada")
    .map((c) => {
      const notas = parseNotas(c.notes);
      return {
        id: c.id,
        tipo: notas.tipo ? (notas.tipo as TipoRegistro) : mapServicioToTipo(c.service),
        fecha: formatearFecha(c.date),
        profesional: c.veterinarian ?? "Veterinario",
        motivo: c.service,
        diagnostico: notas.diagnostico ?? c.notes ?? "—",
        tratamiento: notas.tratamiento ?? "—",
        recomendaciones: notas.recomendaciones ?? "—",
      };
    });

  const ultimaTratamiento = propias.find((c) => {
    const notas = parseNotas(c.notes);
    return notas.tratamiento && notas.tratamiento !== "—";
  });
  const notasUltima = parseNotas(ultimaTratamiento?.notes);

  return {
    id: pet.id,
    nombre: pet.nombre,
    especie: pet.especie,
    raza: pet.raza,
    edad: pet.edad,
    peso: pet.peso,
    propietario: pet.propietarioNombre,
    propietarioId: pet.propietarioId,
    alergias: "No registradas",
    antecedentes: "Sin antecedentes registrados.",
    estado: derivarEstado(citas, pet.id),
    tratamientoActual: notasUltima.tratamiento ?? undefined,
    registros,
  };
}

export default function HistorialPage() {
  const [pacientes, setPacientes] = useState<PacienteClinico[]>([]);
  const [todasLasCitas, setTodasLasCitas] = useState<Appointment[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [registroGuardado, setRegistroGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<FormularioEvolucion>(formularioInicial());

  const user = getCurrentUser();

  useEffect(() => {
    Promise.all([fetchMascotas(), fetchCitas()])
      .then(([pets, citas]) => {
        setTodasLasCitas(citas);
        const built = pets.map((p) => buildPacienteClinico(p, citas));
        setPacientes(built);

        const parametros = new URLSearchParams(window.location.search);
        const pacienteUrl = parametros.get("paciente");
        const accion = parametros.get("accion");

        const inicial = built.find((p) => p.id === pacienteUrl) ?? built[0];
        if (inicial) setPacienteSeleccionado(inicial.id);
        if (accion === "evolucion") setMostrarFormulario(true);
      })
      .catch(() => setError("No se pudo cargar los expedientes. Verifica la conexión con el servidor."))
      .finally(() => setLoading(false));
  }, []);

  const paciente = pacientes.find((p) => p.id === pacienteSeleccionado) ?? null;

  function seleccionarPaciente(id: string) {
    setPacienteSeleccionado(id);
    setRegistroGuardado(false);
  }

  function abrirFormulario() {
    setFormulario({ ...formularioInicial(), nuevoEstado: paciente?.estado ?? "En seguimiento" });
    setRegistroGuardado(false);
    setMostrarFormulario(true);
  }

  function cerrarFormulario() {
    setMostrarFormulario(false);
    setFormulario(formularioInicial());
  }

  async function handleGuardarEvolucion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!paciente) return;

    setGuardando(true);
    setError(null);
    try {
      const notasClinicas = JSON.stringify({
        tipo: "Evolución clínica",
        diagnostico: formulario.evolucion,
        tratamiento: formulario.cambioTratamiento || "Sin cambios en el tratamiento actual.",
        recomendaciones: formulario.proximoControl
          ? `${formulario.recomendaciones} Próximo control: ${formulario.proximoControl}.`
          : formulario.recomendaciones,
      });

      const nuevaCita = await createCita({
        date: fechaHoy(),
        time: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false }),
        petId: paciente.id,
        ownerId: paciente.propietarioId,
        petName: paciente.nombre,
        ownerName: paciente.propietario,
        petEspecie: paciente.especie,
        petRaza: paciente.raza,
        service: "Evolución clínica",
        status: "Finalizada",
        notes: notasClinicas,
        veterinarian: user?.name ?? undefined,
      });

      const nuevoRegistro: RegistroClinico = {
        id: nuevaCita.id,
        tipo: "Evolución clínica",
        fecha: formatearFecha(nuevaCita.date),
        profesional: nuevaCita.veterinarian ?? user?.name ?? "Veterinario",
        motivo: "Seguimiento clínico",
        diagnostico: formulario.evolucion,
        tratamiento: formulario.cambioTratamiento || "Sin cambios en el tratamiento actual.",
        recomendaciones: formulario.proximoControl
          ? `${formulario.recomendaciones} Próximo control: ${formulario.proximoControl}.`
          : formulario.recomendaciones,
      };

      setPacientes((prev) =>
        prev.map((p) =>
          p.id === pacienteSeleccionado
            ? {
                ...p,
                estado: formulario.nuevoEstado,
                tratamientoActual: formulario.cambioTratamiento || p.tratamientoActual,
                registros: [nuevoRegistro, ...p.registros],
              }
            : p
        )
      );

      setMostrarFormulario(false);
      setRegistroGuardado(true);
      setFormulario(formularioInicial());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la evolución.");
    } finally {
      setGuardando(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">Cargando expedientes clínicos...</p>
      </div>
    );
  }

  if (!paciente && pacientes.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-[24px] border border-[#E2E8F0] bg-white dark:border-[#334155] dark:bg-[#111827]">
        <p className="text-[16px] font-semibold text-[#10213A] dark:text-white">No hay pacientes registrados</p>
        <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">Registra mascotas primero para ver sus expedientes.</p>
        <Link href="/veterinario/mascotas" className="rounded-xl bg-[#2F6BFF] px-5 py-3 text-[13px] font-semibold text-white">
          Ver pacientes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <header className="rounded-[24px] border border-[#CBD5E1] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-[#334155] dark:bg-[#111827]">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#64748B] dark:text-[#94A3B8]">
              Historial clínico
            </p>
            <h1 className="mt-3 text-3xl font-bold text-[#10213A] dark:text-white">
              Expediente clínico del paciente
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#64748B] dark:text-[#94A3B8]">
              Consulta antecedentes, tratamientos y evoluciones médicas registradas.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/veterinario/mascotas"
              className="flex h-[48px] items-center justify-center rounded-xl border border-[#CBD5E1] px-5 text-[14px] font-semibold text-[#475569] transition hover:bg-[#F8FAFC] dark:border-[#334155] dark:text-[#CBD5E1]"
            >
              Volver a pacientes
            </Link>

            {paciente && (
              <button
                type="button"
                onClick={abrirFormulario}
                className="flex h-[48px] items-center justify-center rounded-xl bg-[#2F6BFF] px-5 text-[14px] font-semibold text-white transition hover:bg-[#2459DF]"
              >
                + Agregar evolución clínica
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ERROR */}
      {error && (
        <div className="flex items-start justify-between gap-4 rounded-[16px] border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 dark:border-[#7F1D1D] dark:bg-[#450A0A]">
          <p className="text-[14px] text-[#B91C1C] dark:text-[#FECACA]">{error}</p>
          <button type="button" onClick={() => setError(null)} className="text-[18px] font-semibold text-[#B91C1C]">×</button>
        </div>
      )}

      {registroGuardado && paciente && (
        <div className="flex items-start justify-between gap-4 rounded-[16px] border border-[#BBF7D0] bg-[#F0FDF4] px-5 py-4">
          <div>
            <p className="text-[14px] font-semibold text-[#15803D]">Evolución clínica registrada</p>
            <p className="mt-1 text-[13px] text-[#166534]">
              El nuevo registro fue agregado al historial de {paciente.nombre} sin modificar las atenciones anteriores.
            </p>
          </div>
          <button type="button" onClick={() => setRegistroGuardado(false)} className="text-[18px] font-semibold text-[#15803D]" aria-label="Cerrar mensaje">×</button>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
        {/* LISTA DE PACIENTES */}
        <aside className="rounded-[20px] border border-[#CBD5E1] bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.06)] dark:border-[#334155] dark:bg-[#111827]">
          <h2 className="text-[17px] font-semibold text-[#10213A] dark:text-white">Seleccionar paciente</h2>
          <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">Expedientes disponibles.</p>

          <div className="mt-5 space-y-3">
            {pacientes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => seleccionarPaciente(item.id)}
                className={`w-full rounded-[15px] border px-4 py-4 text-left transition ${
                  item.id === pacienteSeleccionado
                    ? "border-[#2F6BFF] bg-[#EFF6FF] dark:bg-[#172554]"
                    : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#BFDBFE] dark:border-[#334155] dark:bg-[#0F172A]"
                }`}
              >
                <p className="text-[14px] font-semibold text-[#10213A] dark:text-white">{item.nombre}</p>
                <p className="mt-1 text-[12px] text-[#64748B] dark:text-[#94A3B8]">{item.especie} · {item.propietario}</p>
                <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${estiloEstado(item.estado)}`}>
                  {item.estado}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* EXPEDIENTE */}
        {paciente && (
          <main className="space-y-5">
            {/* DATOS DEL PACIENTE */}
            <section className="rounded-[20px] border border-[#CBD5E1] bg-white p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)] dark:border-[#334155] dark:bg-[#111827]">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-[25px] font-bold text-[#10213A] dark:text-white">{paciente.nombre}</h2>
                    <span className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${estiloEstado(paciente.estado)}`}>
                      {paciente.estado}
                    </span>
                  </div>
                  <p className="mt-2 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                    {paciente.especie} · {paciente.raza} · Propietario: {paciente.propietario}
                  </p>
                </div>

                <Link
                  href={`/veterinario/consulta?paciente=${paciente.id}`}
                  className="flex h-[44px] items-center justify-center rounded-xl border border-[#D6E3FF] px-4 text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF]"
                >
                  Registrar nueva consulta
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DatoClinico titulo="Edad" valor={paciente.edad || "No registrada"} />
                <DatoClinico titulo="Peso" valor={paciente.peso || "No registrado"} />
                <DatoClinico titulo="Alergias" valor={paciente.alergias} />
                <DatoClinico titulo="Registros clínicos" valor={`${paciente.registros.length} registros`} />
              </div>

              <div className="mt-5 rounded-[15px] border border-[#E2E8F0] px-4 py-4 dark:border-[#334155]">
                <p className="text-[13px] font-semibold text-[#334155] dark:text-[#CBD5E1]">Antecedentes relevantes</p>
                <p className="mt-2 text-[14px] leading-6 text-[#64748B] dark:text-[#94A3B8]">{paciente.antecedentes}</p>
              </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-[1fr_310px]">
              {/* LÍNEA DE TIEMPO */}
              <section className="rounded-[20px] border border-[#CBD5E1] bg-white p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)] dark:border-[#334155] dark:bg-[#111827]">
                <div className="mb-5">
                  <h2 className="text-[18px] font-semibold text-[#10213A] dark:text-white">Historial de atenciones</h2>
                  <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">Registros ordenados del más reciente al más antiguo.</p>
                </div>

                {paciente.registros.length === 0 ? (
                  <div className="rounded-[18px] border border-dashed border-[#CBD5E1] px-5 py-10 text-center dark:border-[#334155]">
                    <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                      Este paciente no tiene atenciones registradas aún.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paciente.registros.map((registro) => (
                      <article
                        key={registro.id}
                        className="rounded-[18px] border border-[#E5EAF2] bg-[#F8FAFC] p-5 dark:border-[#334155] dark:bg-[#0F172A]"
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${estiloTipoRegistro(registro.tipo)}`}>
                              {registro.tipo}
                            </span>
                            <h3 className="mt-3 text-[15px] font-semibold text-[#10213A] dark:text-white">{registro.motivo}</h3>
                            <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                              {registro.profesional} · {registro.fecha}
                            </p>
                          </div>
                          <span className="rounded-full bg-[#F1F5F9] px-3 py-1 text-[11px] font-semibold text-[#64748B] dark:bg-[#1E293B] dark:text-[#CBD5E1]">
                            Solo lectura
                          </span>
                        </div>

                        <div className="mt-4 space-y-3 text-[13px] leading-6">
                          <DetalleRegistro titulo="Diagnóstico / evolución" valor={registro.diagnostico} />
                          <DetalleRegistro titulo="Tratamiento" valor={registro.tratamiento} />
                          <DetalleRegistro titulo="Recomendaciones" valor={registro.recomendaciones} />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              {/* COLUMNA DERECHA */}
              <div className="space-y-5">
                <section className="rounded-[20px] border border-[#CBD5E1] bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.06)] dark:border-[#334155] dark:bg-[#111827]">
                  <h3 className="text-[17px] font-semibold text-[#10213A] dark:text-white">Documento adjunto</h3>
                  <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">Historia clínica cargada previamente.</p>
                  <div className="mt-4 rounded-[15px] border border-dashed border-[#CBD5E1] px-4 py-6 text-center dark:border-[#334155]">
                    <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                      Los documentos adjuntos se gestionan desde el módulo de administración.
                    </p>
                  </div>
                </section>

                <section className="rounded-[20px] border border-[#CBD5E1] bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.06)] dark:border-[#334155] dark:bg-[#111827]">
                  <h3 className="text-[17px] font-semibold text-[#10213A] dark:text-white">Tratamiento actual</h3>

                  {paciente.tratamientoActual ? (
                    <>
                      <p className="mt-3 text-[14px] leading-6 text-[#475569] dark:text-[#CBD5E1]">
                        {paciente.tratamientoActual}
                      </p>
                      <button
                        type="button"
                        onClick={abrirFormulario}
                        className="mt-4 flex h-[42px] w-full items-center justify-center rounded-xl bg-[#2F6BFF] text-[13px] font-semibold text-white transition hover:bg-[#2459DF]"
                      >
                        Registrar cambio
                      </button>
                    </>
                  ) : (
                    <p className="mt-3 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                      No hay tratamiento activo registrado.
                    </p>
                  )}
                </section>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* MODAL AGREGAR EVOLUCIÓN */}
      {mostrarFormulario && paciente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 px-4 py-6">
          <section className="max-h-[95vh] w-full max-w-[760px] overflow-y-auto rounded-[24px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)] dark:bg-[#111827]">
            <div className="flex items-start justify-between border-b border-[#E2E8F0] px-6 py-5 dark:border-[#334155]">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
                  Seguimiento clínico
                </p>
                <h2 className="mt-2 text-[24px] font-bold text-[#10213A] dark:text-white">
                  Agregar evolución de {paciente.nombre}
                </h2>
                <p className="mt-2 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                  Este registro será añadido al historial sin modificar la información anterior.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarFormulario}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[25px] text-[#64748B] transition hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
                aria-label="Cerrar formulario"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleGuardarEvolucion} className="space-y-5 p-6">
              <Campo label="Evolución del paciente">
                <textarea
                  required
                  rows={4}
                  value={formulario.evolucion}
                  onChange={(event) => setFormulario((actual) => ({ ...actual, evolucion: event.target.value }))}
                  placeholder="Describe la respuesta clínica, síntomas actuales y hallazgos..."
                  className={`${campoClases} min-h-[110px] resize-none py-3`}
                />
              </Campo>

              <Campo label="Cambio o continuidad del tratamiento">
                <textarea
                  rows={3}
                  value={formulario.cambioTratamiento}
                  onChange={(event) => setFormulario((actual) => ({ ...actual, cambioTratamiento: event.target.value }))}
                  placeholder="Ej. Continuar antibiótico por 3 días adicionales..."
                  className={`${campoClases} min-h-[90px] resize-none py-3`}
                />
              </Campo>

              <Campo label="Recomendaciones">
                <textarea
                  required
                  rows={3}
                  value={formulario.recomendaciones}
                  onChange={(event) => setFormulario((actual) => ({ ...actual, recomendaciones: event.target.value }))}
                  placeholder="Cuidados, signos de alarma y recomendaciones para el propietario..."
                  className={`${campoClases} min-h-[90px] resize-none py-3`}
                />
              </Campo>

              <div className="grid gap-5 md:grid-cols-2">
                <Campo label="Próximo control">
                  <input
                    type="date"
                    value={formulario.proximoControl}
                    onChange={(event) => setFormulario((actual) => ({ ...actual, proximoControl: event.target.value }))}
                    className={campoClases}
                  />
                </Campo>

                <Campo label="Estado clínico actualizado">
                  <select
                    value={formulario.nuevoEstado}
                    onChange={(event) => setFormulario((actual) => ({ ...actual, nuevoEstado: event.target.value as EstadoClinico }))}
                    className={campoClases}
                  >
                    <option value="Atendido hoy">Atendido hoy</option>
                    <option value="En seguimiento">En seguimiento</option>
                    <option value="Tratamiento activo">Tratamiento activo</option>
                    <option value="Control programado">Control programado</option>
                  </select>
                </Campo>
              </div>

              <div className="rounded-[14px] border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-3 text-[13px] leading-6 text-[#1D4ED8] dark:border-[#1E3A8A] dark:bg-[#172554] dark:text-[#BFDBFE]">
                Las evoluciones se agregan como nuevos registros cronológicos. Las consultas anteriores permanecen en modo de solo lectura.
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 dark:border-[#334155] sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarFormulario}
                  className="flex h-[46px] items-center justify-center rounded-xl border border-[#CBD5E1] px-6 text-[14px] font-semibold text-[#475569] transition hover:bg-[#F8FAFC] dark:border-[#334155] dark:text-[#CBD5E1]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="flex h-[46px] items-center justify-center rounded-xl bg-[#2F6BFF] px-7 text-[14px] font-semibold text-white transition hover:bg-[#2459DF] disabled:opacity-60"
                >
                  {guardando ? "Guardando..." : "Guardar evolución"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function DatoClinico({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 dark:bg-[#0F172A]">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">{titulo}</p>
      <p className="mt-2 text-[14px] font-medium text-[#10213A] dark:text-white">{valor}</p>
    </div>
  );
}

function DetalleRegistro({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <p className="text-[#475569] dark:text-[#CBD5E1]">
      <span className="font-semibold">{titulo}:</span> {valor}
    </p>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#334155] dark:text-[#CBD5E1]">{label}</span>
      {children}
    </label>
  );
}

function estiloEstado(estado: EstadoClinico) {
  switch (estado) {
    case "Por atender": return "bg-[#FEF3C7] text-[#B45309] dark:bg-[#78350F] dark:text-[#FDE68A]";
    case "Atendido hoy": return "bg-[#DCFCE7] text-[#15803D] dark:bg-[#14532D] dark:text-[#BBF7D0]";
    case "En seguimiento": return "bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]";
    case "Tratamiento activo": return "bg-[#FEE2E2] text-[#B91C1C] dark:bg-[#7F1D1D] dark:text-[#FECACA]";
    case "Control programado": return "bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#4C1D95] dark:text-[#DDD6FE]";
  }
}

function estiloTipoRegistro(tipo: TipoRegistro) {
  switch (tipo) {
    case "Evolución clínica": return "bg-[#DCFCE7] text-[#15803D] dark:bg-[#14532D] dark:text-[#BBF7D0]";
    case "Procedimiento": return "bg-[#FEE2E2] text-[#B91C1C] dark:bg-[#7F1D1D] dark:text-[#FECACA]";
    case "Vacunación": return "bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#4C1D95] dark:text-[#DDD6FE]";
    case "Control": return "bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]";
    case "Consulta": return "bg-[#E0F2FE] text-[#0369A1] dark:bg-[#0C4A6E] dark:text-[#BAE6FD]";
  }
}

const campoClases =
  "h-[48px] w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-[14px] text-[#10213A] outline-none transition focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:placeholder:text-[#94A3B8]";
