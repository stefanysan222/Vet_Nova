"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

const PETS_STORAGE_KEY = "vetnova_mascotas_cliente";
const APPOINTMENTS_STORAGE_KEY = "vetnova_citas_cliente";
const PROFILE_STORAGE_KEY = "vetnova_cliente_perfil";

type EstadoCita = "Pendiente" | "Confirmada" | "Cancelada";

type Mascota = {
  id: string;
  nombre: string;
  tipo: "perro" | "gato" | "otro";
  especie: string;
  raza: string;
  edad?: string;
  dueño?: string;
  foto?: string | null;
};

type PerfilCliente = {
  nombre?: string;
  apellido?: string;
};

type FormularioCita = {
  mascotaId: string;
  servicio: string;
  fecha: string;
  hora: string;
  motivo: string;
  observaciones: string;
};

type CitaGuardada = {
  id: string;
  mascotaId: string;
  mascota: string;
  mascotaNombre: string;
  especie: string;
  raza: string;
  propietario: string;
  servicio: string;
  tipoCita: string;
  fecha: string;
  hora: string;
  motivo: string;
  observaciones: string;
  veterinario: string;
  estado: EstadoCita;
  fechaCreacion: string;
};

const mascotasIniciales: Mascota[] = [
  {
    id: "max",
    nombre: "Max",
    tipo: "perro",
    especie: "Perro",
    raza: "Golden Retriever",
    edad: "3 años",
    dueño: "Anderson Ibáñez",
    foto: null,
  },
];

const servicios = [
  "Consulta general",
  "Vacunación",
  "Desparasitación",
  "Control médico",
  "Urgencia",
];

const horariosDisponibles = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
];

const formularioInicial: FormularioCita = {
  mascotaId: "",
  servicio: "",
  fecha: "",
  hora: "",
  motivo: "",
  observaciones: "",
};

const labelClassName =
  "text-[14px] font-semibold text-[#10213A] dark:text-white";

const inputClassName =
  "mt-2 h-[48px] w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-[15px] text-[#10213A] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/10 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:placeholder:text-[#64748B] dark:focus:border-[#2F6BFF]";

export default function NuevaCitaPage() {
  const router = useRouter();

  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [propietario, setPropietario] = useState("Cliente");
  const [formulario, setFormulario] =
    useState<FormularioCita>(formularioInicial);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarDatos = () => {
      setPropietario(leerNombrePropietario());

      try {
        const registroGuardado = localStorage.getItem(PETS_STORAGE_KEY);

        const mascotasRegistradas: Mascota[] = registroGuardado
          ? (JSON.parse(registroGuardado) as Mascota[])
          : [];

        const mascotasDisponibles = eliminarDuplicados([
          ...mascotasRegistradas,
          ...mascotasIniciales,
        ]);

        setMascotas(mascotasDisponibles);

        if (mascotasDisponibles.length > 0) {
          setFormulario((actual) => ({
            ...actual,
            mascotaId: actual.mascotaId || mascotasDisponibles[0].id,
          }));
        }
      } catch {
        setMascotas(mascotasIniciales);

        setFormulario((actual) => ({
          ...actual,
          mascotaId: actual.mascotaId || mascotasIniciales[0].id,
        }));
      }
    };

    cargarDatos();

    window.addEventListener("vetnova-pets-updated", cargarDatos);
    window.addEventListener("vetnova-profile-updated", cargarDatos);
    window.addEventListener("storage", cargarDatos);

    return () => {
      window.removeEventListener("vetnova-pets-updated", cargarDatos);
      window.removeEventListener("vetnova-profile-updated", cargarDatos);
      window.removeEventListener("storage", cargarDatos);
    };
  }, []);

  const mascotaSeleccionada = useMemo(
    () => mascotas.find((mascota) => mascota.id === formulario.mascotaId),
    [mascotas, formulario.mascotaId]
  );

  const actualizarCampo = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));

    setError("");
  };

  const agendarCita = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!formulario.mascotaId) {
      setError("Selecciona la mascota para la cita.");
      return;
    }

    if (!formulario.servicio) {
      setError("Selecciona el servicio requerido.");
      return;
    }

    if (!formulario.fecha || !formulario.hora) {
      setError("Selecciona la fecha y la hora de la cita.");
      return;
    }

    if (!mascotaSeleccionada) {
      setError("No fue posible identificar la mascota seleccionada.");
      return;
    }

    const fechaSeleccionada = new Date(`${formulario.fecha}T00:00:00`);
    const fechaMinima = new Date(`${obtenerFechaActual()}T00:00:00`);

    if (fechaSeleccionada < fechaMinima) {
      setError("La fecha de la cita no puede ser anterior a hoy.");
      return;
    }

    setGuardando(true);

    const nuevaCita: CitaGuardada = {
      id: crypto.randomUUID(),
      mascotaId: mascotaSeleccionada.id,
      mascota: mascotaSeleccionada.nombre,
      mascotaNombre: mascotaSeleccionada.nombre,
      especie: mascotaSeleccionada.especie,
      raza: mascotaSeleccionada.raza,
      propietario,
      servicio: formulario.servicio,
      tipoCita: formulario.servicio,
      fecha: formulario.fecha,
      hora: formulario.hora,
      motivo: formulario.motivo.trim() || formulario.servicio,
      observaciones: formulario.observaciones.trim(),
      veterinario: "Por asignar",
      estado: "Pendiente",
      fechaCreacion: new Date().toISOString(),
    };

    try {
      const citasGuardadas = leerCitasGuardadas();

      const horarioOcupado = citasGuardadas.some(
        (cita) =>
          cita.fecha === nuevaCita.fecha &&
          cita.hora === nuevaCita.hora &&
          cita.estado !== "Cancelada"
      );

      if (horarioOcupado) {
        setError(
          "Ya tienes una cita registrada en esa fecha y hora. Selecciona otro horario."
        );
        setGuardando(false);
        return;
      }

      localStorage.setItem(
        APPOINTMENTS_STORAGE_KEY,
        JSON.stringify([nuevaCita, ...citasGuardadas])
      );

      window.dispatchEvent(new Event("vetnova-appointments-updated"));
      window.dispatchEvent(new Event("vetnova-citas-updated"));

      router.push("/cliente/agendar");
    } catch {
      setGuardando(false);
      setError("No fue posible guardar la cita. Intenta nuevamente.");
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
      <div className="mb-8">
        <Link
          href="/cliente/agendar"
          className="mb-5 inline-flex items-center gap-2 text-[14px] font-medium text-[#64748B] transition-colors hover:text-[#2F6BFF] dark:text-[#94A3B8] dark:hover:text-[#60A5FA]"
        >
          <ArrowLeftIcon />
          Volver a citas
        </Link>

        <h1 className="text-[24px] font-semibold leading-none text-[#10213A] dark:text-white">
          Agendar Nueva Cita
        </h1>

        <p className="mt-4 text-[16px] text-[#64748B] dark:text-[#94A3B8]">
          Programa una cita veterinaria para tu mascota
        </p>
      </div>

      <form
        onSubmit={agendarCita}
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_360px]"
      >
        <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
              <CalendarIcon />
            </div>

            <div>
              <h2 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
                Información de la cita
              </h2>

              <p className="mt-1 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                Selecciona la mascota, el servicio y el horario
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="mascotaId" className={labelClassName}>
                Mascota
                <span className="ml-1 text-[#2F6BFF]">*</span>
              </label>

              <select
                id="mascotaId"
                name="mascotaId"
                value={formulario.mascotaId}
                onChange={actualizarCampo}
                required
                className={inputClassName}
              >
                {mascotas.length === 0 && (
                  <option value="">No tienes mascotas registradas</option>
                )}

                {mascotas.map((mascota) => (
                  <option key={mascota.id} value={mascota.id}>
                    {mascota.nombre} · {mascota.especie} · {mascota.raza}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="servicio" className={labelClassName}>
                Tipo de servicio
                <span className="ml-1 text-[#2F6BFF]">*</span>
              </label>

              <select
                id="servicio"
                name="servicio"
                value={formulario.servicio}
                onChange={actualizarCampo}
                required
                className={inputClassName}
              >
                <option value="">Selecciona un servicio</option>

                {servicios.map((servicio) => (
                  <option key={servicio} value={servicio}>
                    {servicio}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="fecha" className={labelClassName}>
                Fecha
                <span className="ml-1 text-[#2F6BFF]">*</span>
              </label>

              <input
                id="fecha"
                name="fecha"
                type="date"
                min={obtenerFechaActual()}
                value={formulario.fecha}
                onChange={actualizarCampo}
                required
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="hora" className={labelClassName}>
                Hora
                <span className="ml-1 text-[#2F6BFF]">*</span>
              </label>

              <select
                id="hora"
                name="hora"
                value={formulario.hora}
                onChange={actualizarCampo}
                required
                className={inputClassName}
              >
                <option value="">Selecciona una hora</option>

                {horariosDisponibles.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="motivo" className={labelClassName}>
                Motivo de la consulta
              </label>

              <input
                id="motivo"
                name="motivo"
                type="text"
                value={formulario.motivo}
                onChange={actualizarCampo}
                placeholder="Ej. Vacunación anual, control general, malestar..."
                className={inputClassName}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="observaciones" className={labelClassName}>
                Observaciones adicionales
              </label>

              <textarea
                id="observaciones"
                name="observaciones"
                rows={4}
                value={formulario.observaciones}
                onChange={actualizarCampo}
                placeholder="Describe síntomas, cuidados especiales u otra información importante para el veterinario..."
                className="mt-2 w-full resize-none rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-[15px] text-[#10213A] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/10 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:placeholder:text-[#64748B] dark:focus:border-[#2F6BFF]"
              />
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-[#F1CDD1] bg-[#FFF2F3] px-4 py-3 text-[14px] font-medium text-[#DC3545] dark:border-[#67333B] dark:bg-[#28171B]">
              {error}
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
            <h2 className="text-[18px] font-semibold text-[#10213A] dark:text-white">
              Resumen de la cita
            </h2>

            {mascotaSeleccionada ? (
              <div className="mt-5 rounded-xl bg-[#F5F7FB] p-4 dark:bg-[#0F172A]">
                <div className="flex items-center gap-3">
                  <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
                    {mascotaSeleccionada.tipo === "gato" ? (
                      <CatIcon />
                    ) : (
                      <DogIcon />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-[#10213A] dark:text-white">
                      {mascotaSeleccionada.nombre}
                    </p>

                    <p className="mt-1 truncate text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                      {mascotaSeleccionada.especie} ·{" "}
                      {mascotaSeleccionada.raza}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-5 rounded-xl bg-[#F5F7FB] p-4 text-[14px] text-[#64748B] dark:bg-[#0F172A] dark:text-[#94A3B8]">
                Selecciona una mascota para continuar.
              </p>
            )}

            <div className="mt-5 space-y-4 border-t border-[#E2E8F0] pt-5 dark:border-[#334155]">
              <ResumenDato
                label="Servicio"
                value={formulario.servicio || "Sin seleccionar"}
              />

              <ResumenDato
                label="Fecha"
                value={
                  formulario.fecha
                    ? formatearFecha(formulario.fecha)
                    : "Sin seleccionar"
                }
              />

              <ResumenDato
                label="Hora"
                value={formulario.hora || "Sin seleccionar"}
              />

              <ResumenDato label="Estado inicial" value="Pendiente" />
            </div>
          </section>

          <section className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
            <button
              type="submit"
              disabled={guardando || mascotas.length === 0}
              className="inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#2F6BFF] px-6 text-[15px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#2457D6] hover:shadow-[0_10px_20px_rgba(47,107,255,0.28)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <CalendarCheckIcon />
              {guardando ? "Agendando..." : "Agendar Cita"}
            </button>

            <Link
              href="/cliente/agendar"
              className="mt-3 inline-flex h-[48px] w-full items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-6 text-[15px] font-semibold text-[#10213A] transition-all hover:bg-[#F8FAFD] dark:border-[#334155] dark:bg-[#111827] dark:text-white dark:hover:bg-[#0F172A]"
            >
              Cancelar
            </Link>
          </section>

          <section className="flex items-start gap-3 rounded-xl border border-[#D6E1F0] bg-[#F8FAFD] px-4 py-4 dark:border-[#334155] dark:bg-[#111827]">
            <InfoIcon />

            <p className="text-[13px] leading-6 text-[#64748B] dark:text-[#94A3B8]">
              La cita quedará registrada en estado pendiente hasta que sea
              confirmada por la clínica veterinaria.
            </p>
          </section>
        </aside>
      </form>
    </div>
  );
}

function leerNombrePropietario() {
  try {
    const informacionGuardada = localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!informacionGuardada) {
      return "Anderson Ibáñez";
    }

    const perfil = JSON.parse(informacionGuardada) as PerfilCliente;

    const nombreCompleto = `${perfil.nombre?.trim() || ""} ${
      perfil.apellido?.trim() || ""
    }`.trim();

    return nombreCompleto || "Anderson Ibáñez";
  } catch {
    return "Anderson Ibáñez";
  }
}

function leerCitasGuardadas(): CitaGuardada[] {
  try {
    const registroGuardado = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);

    return registroGuardado
      ? (JSON.parse(registroGuardado) as CitaGuardada[])
      : [];
  } catch {
    return [];
  }
}

function eliminarDuplicados(mascotas: Mascota[]) {
  const idsRegistrados = new Set<string>();

  return mascotas.filter((mascota) => {
    if (idsRegistrados.has(mascota.id)) {
      return false;
    }

    idsRegistrados.add(mascota.id);
    return true;
  });
}

function obtenerFechaActual() {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${año}-${mes}-${dia}`;
}

function formatearFecha(fecha: string) {
  const fechaLocal = new Date(`${fecha}T00:00:00`);

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fechaLocal);
}

function ResumenDato({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
        {label}
      </p>

      <p className="mt-1 text-[14px] font-semibold text-[#10213A] dark:text-white">
        {value}
      </p>
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="m15 18-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M8 3v4M16 3v4M4 10h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M8 14h3M8 17h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M8 3v4M16 3v4M4 10h16M8.5 15l2 2 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DogIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 9 4 7v7c0 4 3.2 6 8 6s8-2 8-6V7l-3 2M9 14h.01M15 14h.01M10 17c1 .7 3 .7 4 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CatIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 9 7 4l4 3h2l4-3 2 5v6c0 3-3 5-7 5s-7-2-7-5V9ZM9 13h.01M15 13h.01M10 16c1.1.6 2.9.6 4 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="mt-0.5 shrink-0 text-[#2F6BFF]"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M12 10.5v6M12 7.5h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}