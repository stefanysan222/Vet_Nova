"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { updateUsuario } from "../../../lib/api/usuarios";
import { fetchMiPerfilVeterinario, updateMiPerfilVeterinario } from "../../../lib/api/veterinarios";
import { useToast } from "../../components/ui/Toast";

interface PerfilVeterinario {
  nombre: string;
  cargo: string;
  especialidad: string;
  registroProfesional: string;
  email: string;
  telefono: string;
  horarioAtencion: string;
}

interface FormularioSeguridad {
  contrasenaActual: string;
  nuevaContrasena: string;
  confirmarContrasena: string;
}

const seguridadInicial: FormularioSeguridad = {
  contrasenaActual: "",
  nuevaContrasena: "",
  confirmarContrasena: "",
};

export default function ConfiguracionVeterinarioPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const perfilVacio: PerfilVeterinario = {
    nombre: "",
    cargo: "Veterinario",
    especialidad: "",
    registroProfesional: "",
    email: "",
    telefono: "",
    horarioAtencion: "",
  };

  const [perfil, setPerfil] = useState<PerfilVeterinario>(perfilVacio);
  const [perfilGuardado, setPerfilGuardado] = useState<PerfilVeterinario>(perfilVacio);
  const [guardando, setGuardando] = useState(false);
  const [seguridad, setSeguridad] = useState<FormularioSeguridad>(seguridadInicial);
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [mensajePerfil, setMensajePerfil] = useState("");
  const [mensajeSeguridad, setMensajeSeguridad] = useState("");
  const [errorSeguridad, setErrorSeguridad] = useState("");

  useEffect(() => {
    if (!user) return;

    const perfilBase: PerfilVeterinario = {
      ...perfilVacio,
      nombre: user.name ?? "",
      email: user.email ?? "",
    };

    fetchMiPerfilVeterinario()
      .then((extra) => {
        const completo: PerfilVeterinario = {
          ...perfilBase,
          especialidad: extra.especialidad ?? "",
          registroProfesional: extra.registroProfesional ?? "",
          telefono: extra.telefono ?? "",
          horarioAtencion: extra.horarioAtencion ?? "",
        };
        setPerfil(completo);
        setPerfilGuardado(completo);
      })
      .catch(() => {
        setPerfil(perfilBase);
        setPerfilGuardado(perfilBase);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function actualizarPerfil(campo: keyof PerfilVeterinario, valor: string) {
    setPerfil((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    setMensajePerfil("");
  }

  async function guardarPerfil(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setGuardando(true);
    try {
      await updateUsuario(user.id, { nombre: perfil.nombre.trim(), email: perfil.email.trim() });
      const extra = await updateMiPerfilVeterinario({
        especialidad: perfil.especialidad,
        telefono: perfil.telefono,
        horarioAtencion: perfil.horarioAtencion,
        registroProfesional: perfil.registroProfesional,
      });
      const actualizado: PerfilVeterinario = {
        ...perfil,
        especialidad: extra.especialidad ?? "",
        registroProfesional: extra.registroProfesional ?? "",
        telefono: extra.telefono ?? "",
        horarioAtencion: extra.horarioAtencion ?? "",
      };
      setPerfil(actualizado);
      setPerfilGuardado(actualizado);
      success("Perfil actualizado", "Los cambios se guardaron correctamente.");
      setMensajePerfil("La información personal fue actualizada correctamente.");
    } catch (err) {
      toastError(
        "Error al guardar",
        err instanceof Error ? err.message : "No se pudo actualizar el perfil.",
      );
    } finally {
      setGuardando(false);
    }
  }

  function cancelarCambiosPerfil() {
    setPerfil(perfilGuardado);
    setMensajePerfil("");
  }

  function actualizarSeguridad(campo: keyof FormularioSeguridad, valor: string) {
    setSeguridad((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    setMensajeSeguridad("");
    setErrorSeguridad("");
  }

  async function actualizarContrasena(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !seguridad.contrasenaActual ||
      !seguridad.nuevaContrasena ||
      !seguridad.confirmarContrasena
    ) {
      setErrorSeguridad("Debes completar todos los campos de contraseña.");
      return;
    }
    if (seguridad.nuevaContrasena.length < 8) {
      setErrorSeguridad("La nueva contraseña debe contener mínimo 8 caracteres.");
      return;
    }
    if (seguridad.nuevaContrasena !== seguridad.confirmarContrasena) {
      setErrorSeguridad("Las nuevas contraseñas no coinciden.");
      return;
    }
    if (!user) return;
    setGuardandoPassword(true);
    setErrorSeguridad("");
    try {
      await updateUsuario(user.id, {
        password: seguridad.nuevaContrasena,
        currentPassword: seguridad.contrasenaActual,
      });
      setMensajeSeguridad("La contraseña fue actualizada correctamente.");
      setSeguridad(seguridadInicial);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo actualizar la contraseña.";
      setErrorSeguridad(msg === "Forbidden" ? "La contraseña actual es incorrecta." : msg);
    } finally {
      setGuardandoPassword(false);
    }
  }

  function cancelarCambioContrasena() {
    setSeguridad(seguridadInicial);
    setMensajeSeguridad("");
    setErrorSeguridad("");
  }

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <header className="profile-enter relative overflow-hidden rounded-[26px] border border-[#DCE7F7] bg-gradient-to-r from-white via-[#F8FBFF] to-[#EEF5FF] p-7 shadow-[0_12px_34px_rgba(15,23,42,0.06)] dark:border-[#233552] dark:from-[#111827] dark:via-[#111827] dark:to-[#12213A]">
        <div className="profile-orb absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#DBEAFE]/70 blur-3xl dark:bg-[#2563EB]/20" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2563EB] dark:text-[#93C5FD]">
              Mi perfil
            </p>

            <h1 className="mt-3 text-[30px] font-bold text-[#10213A] dark:text-white">
              Información del veterinario
            </h1>

            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#64748B] dark:text-[#94A3B8]">
              Consulta y actualiza tus datos profesionales y administra la seguridad de tu cuenta.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-[18px] border border-white bg-white/80 px-5 py-4 shadow-[0_10px_26px_rgba(37,99,235,0.08)] dark:border-[#334155] dark:bg-[#0F172A]/80">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2F6BFF] text-[19px] font-bold text-white">
              {perfil.nombre.trim()[0]?.toUpperCase() ?? "V"}
            </div>

            <div>
              <p className="text-[15px] font-semibold text-[#10213A] dark:text-white">
                {perfil.nombre}
              </p>

              <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">{perfil.cargo}</p>
            </div>
          </div>
        </div>
      </header>

      {/* INFORMACIÓN PERSONAL */}
      <form
        onSubmit={guardarPerfil}
        className="profile-card rounded-[22px] border border-[#D9E2EF] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] dark:border-[#334155] dark:bg-[#111827]"
      >
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]">
            <ProfileIcon name="user" />
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-[#10213A] dark:text-white">
              Información personal
            </h2>

            <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
              Actualiza tus datos de contacto y consulta tu información profesional.
            </p>
          </div>
        </div>

        {mensajePerfil && (
          <MensajeExito mensaje={mensajePerfil} onClose={() => setMensajePerfil("")} />
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <Campo label="Nombre">
            <input
              type="text"
              value={perfil.nombre}
              onChange={(event) => actualizarPerfil("nombre", event.target.value)}
              required
              className={campoClases}
            />
          </Campo>

          <Campo label="Cargo">
            <input
              type="text"
              value={perfil.cargo}
              readOnly
              className={`${campoClases} cursor-not-allowed bg-[#F8FAFC] text-[#64748B] dark:bg-[#0F172A]`}
            />
          </Campo>

          <Campo label="Especialidad">
            <input
              type="text"
              value={perfil.especialidad}
              onChange={(event) => actualizarPerfil("especialidad", event.target.value)}
              required
              className={campoClases}
            />
          </Campo>

          <Campo label="Registro profesional">
            <input
              type="text"
              value={perfil.registroProfesional}
              readOnly
              className={`${campoClases} cursor-not-allowed bg-[#F8FAFC] text-[#64748B] dark:bg-[#0F172A]`}
            />
          </Campo>

          <Campo label="Correo electrónico">
            <input
              type="email"
              value={perfil.email}
              onChange={(event) => actualizarPerfil("email", event.target.value)}
              required
              className={campoClases}
            />
          </Campo>

          <Campo label="Teléfono">
            <input
              type="tel"
              value={perfil.telefono}
              onChange={(event) => actualizarPerfil("telefono", event.target.value)}
              required
              className={campoClases}
            />
          </Campo>

          <div className="md:col-span-2">
            <Campo label="Horario de atención">
              <input
                type="text"
                value={perfil.horarioAtencion}
                onChange={(event) => actualizarPerfil("horarioAtencion", event.target.value)}
                required
                className={campoClases}
              />
            </Campo>
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 dark:border-[#334155] sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={cancelarCambiosPerfil}
            className="profile-button-secondary flex h-[46px] items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-6 text-[14px] font-semibold text-[#475569] dark:border-[#334155] dark:bg-[#111827] dark:text-[#CBD5E1]"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={guardando}
            className="profile-button-primary flex h-[46px] items-center justify-center gap-2 rounded-xl bg-[#2F6BFF] px-7 text-[14px] font-semibold text-white disabled:opacity-60"
          >
            <ProfileIcon name="save" className="h-[17px] w-[17px]" />
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>

      {/* SEGURIDAD */}
      <form
        onSubmit={actualizarContrasena}
        className="profile-card profile-card-delay rounded-[22px] border border-[#D9E2EF] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] dark:border-[#334155] dark:bg-[#111827]"
      >
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]">
            <ProfileIcon name="lock" />
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-[#10213A] dark:text-white">
              Seguridad de la cuenta
            </h2>

            <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
              Cambia tu contraseña para mantener protegido el acceso a tu perfil veterinario.
            </p>
          </div>
        </div>

        {mensajeSeguridad && (
          <MensajeExito mensaje={mensajeSeguridad} onClose={() => setMensajeSeguridad("")} />
        )}

        {errorSeguridad && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-[15px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 dark:border-[#7F1D1D] dark:bg-[#450A0A]">
            <div className="flex items-start gap-3">
              <ProfileIcon
                name="alert"
                className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#DC2626]"
              />

              <p className="text-[13px] leading-6 text-[#B91C1C] dark:text-[#FECACA]">
                {errorSeguridad}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setErrorSeguridad("")}
              className="text-[18px] font-semibold text-[#DC2626]"
              aria-label="Cerrar alerta"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Campo label="Contraseña actual">
              <input
                type="password"
                value={seguridad.contrasenaActual}
                onChange={(event) => actualizarSeguridad("contrasenaActual", event.target.value)}
                placeholder="Ingresa tu contraseña actual"
                autoComplete="current-password"
                className={campoClases}
              />
            </Campo>
          </div>

          <Campo label="Nueva contraseña">
            <input
              type="password"
              value={seguridad.nuevaContrasena}
              onChange={(event) => actualizarSeguridad("nuevaContrasena", event.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              className={campoClases}
            />
          </Campo>

          <Campo label="Confirmar nueva contraseña">
            <input
              type="password"
              value={seguridad.confirmarContrasena}
              onChange={(event) => actualizarSeguridad("confirmarContrasena", event.target.value)}
              placeholder="Repite la nueva contraseña"
              autoComplete="new-password"
              className={campoClases}
            />
          </Campo>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-[15px] border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-3 dark:border-[#1E3A8A] dark:bg-[#172554]">
          <ProfileIcon
            name="info"
            className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#2563EB] dark:text-[#93C5FD]"
          />

          <p className="text-[13px] leading-6 text-[#1D4ED8] dark:text-[#BFDBFE]">
            Utiliza una contraseña de mínimo 8 caracteres y evita compartir tus credenciales de
            acceso.
          </p>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 dark:border-[#334155] sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={cancelarCambioContrasena}
            className="profile-button-secondary flex h-[46px] items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-6 text-[14px] font-semibold text-[#475569] dark:border-[#334155] dark:bg-[#111827] dark:text-[#CBD5E1]"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={guardandoPassword}
            className="profile-button-primary flex h-[46px] items-center justify-center gap-2 rounded-xl bg-[#2F6BFF] px-7 text-[14px] font-semibold text-white disabled:opacity-60"
          >
            <ProfileIcon name="shield" className="h-[17px] w-[17px]" />
            {guardandoPassword ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </div>
      </form>

      <style jsx global>{`
        @keyframes profile-fade-up {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes profile-orb-move {
          0%,
          100% {
            transform: translate(0px, 0px);
          }
          50% {
            transform: translate(-12px, 10px);
          }
        }

        .profile-enter {
          animation: profile-fade-up 0.45s ease-out both;
        }

        .profile-orb {
          animation: profile-orb-move 7s ease-in-out infinite;
        }

        .profile-card {
          animation: profile-fade-up 0.45s ease-out 0.12s both;
          transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .profile-card-delay {
          animation-delay: 0.2s;
        }

        .profile-card:hover {
          border-color: #bfdbfe;
          box-shadow: 0 16px 32px rgba(15, 23, 42, 0.07);
        }

        .profile-button-primary {
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .profile-button-primary:hover {
          transform: translateY(-2px);
          background: #2459df;
          box-shadow: 0 10px 18px rgba(47, 107, 255, 0.22);
        }

        .profile-button-primary:active {
          transform: translateY(0);
        }

        .profile-button-secondary {
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .profile-button-secondary:hover {
          transform: translateY(-2px);
          border-color: #bfdbfe;
          background: #f8fbff;
        }

        .dark .profile-button-secondary:hover {
          background: #1e293b;
        }

        @media (prefers-reduced-motion: reduce) {
          .profile-enter,
          .profile-orb,
          .profile-card {
            animation: none !important;
          }

          .profile-button-primary:hover,
          .profile-button-secondary:hover {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#334155] dark:text-[#CBD5E1]">
        {label}
      </span>

      {children}
    </label>
  );
}

function MensajeExito({ mensaje, onClose }: { mensaje: string; onClose: () => void }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4 rounded-[15px] border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 dark:border-[#14532D] dark:bg-[#052E16]">
      <div className="flex items-start gap-3">
        <ProfileIcon name="check" className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#16A34A]" />

        <p className="text-[13px] leading-6 text-[#15803D] dark:text-[#BBF7D0]">{mensaje}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="text-[18px] font-semibold text-[#16A34A]"
        aria-label="Cerrar mensaje"
      >
        ×
      </button>
    </div>
  );
}

type IconName = "user" | "lock" | "save" | "shield" | "check" | "alert" | "info";

function ProfileIcon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const svgProps = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "user":
      return (
        <svg {...svgProps}>
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M5 20c0-3.6 2.9-6 7-6s7 2.4 7 6" />
        </svg>
      );

    case "lock":
      return (
        <svg {...svgProps}>
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );

    case "save":
      return (
        <svg {...svgProps}>
          <path d="M5 4h11l3 3v13H5Z" />
          <path d="M8 4v6h8V4" />
          <path d="M8 20v-6h8v6" />
        </svg>
      );

    case "shield":
      return (
        <svg {...svgProps}>
          <path d="M12 3 19 6v5c0 4.4-2.8 7.4-7 10-4.2-2.6-7-5.6-7-10V6Z" />
          <path d="m9 12 2 2 4-5" />
        </svg>
      );

    case "check":
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16 9" />
        </svg>
      );

    case "alert":
      return (
        <svg {...svgProps}>
          <path d="M12 4 21 20H3Z" />
          <path d="M12 10v4M12 17h.01" />
        </svg>
      );

    case "info":
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
      );
  }
}

const campoClases =
  "h-[48px] w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-[14px] text-[#10213A] outline-none transition duration-300 placeholder:text-[#94A3B8] focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:placeholder:text-[#64748B]";
