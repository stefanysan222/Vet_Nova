"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, Lock, Save, ShieldCheck, User, X } from "lucide-react";
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
      setErrorSeguridad(
        err instanceof Error ? err.message : "No se pudo actualizar la contraseña.",
      );
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
      <header className="overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-600 to-brand-700 p-7 text-white shadow-brand dark:border-brand-900/40 dark:from-brand-800 dark:to-brand-950 dark:shadow-brand-sm">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-200">
              Mi perfil
            </p>
            <h1 className="text-display mt-2">Información del veterinario</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-100">
              Consulta y actualiza tus datos profesionales y administra la seguridad de tu cuenta.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-lg font-bold text-brand-600">
              {perfil.nombre.trim()[0]?.toUpperCase() ?? "V"}
            </div>

            <div>
              <p className="text-sm font-semibold text-white">{perfil.nombre}</p>
              <p className="mt-1 text-xs text-brand-100">{perfil.cargo}</p>
            </div>
          </div>
        </div>
      </header>

      {/* INFORMACIÓN PERSONAL */}
      <form
        onSubmit={guardarPerfil}
        className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-700 dark:bg-surface-900"
      >
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
            <User className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-section-title">Información personal</h2>
            <p className="text-subtitle mt-1">
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
              className={`${campoClases} cursor-not-allowed bg-surface-50 text-surface-500 dark:bg-surface-950`}
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
              className={`${campoClases} cursor-not-allowed bg-surface-50 text-surface-500 dark:bg-surface-950`}
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

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-surface-100 pt-5 dark:border-surface-800 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={cancelarCambiosPerfil}
            className="flex h-11 items-center justify-center rounded-xl border border-surface-300 bg-white px-6 text-sm font-semibold text-surface-600 transition hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:bg-surface-800"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={guardando}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-7 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            <Save className="h-[17px] w-[17px]" />
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>

      {/* SEGURIDAD */}
      <form
        onSubmit={actualizarContrasena}
        className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-700 dark:bg-surface-900"
      >
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
            <Lock className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-section-title">Seguridad de la cuenta</h2>
            <p className="text-subtitle mt-1">
              Cambia tu contraseña para mantener protegido el acceso a tu perfil veterinario.
            </p>
          </div>
        </div>

        {mensajeSeguridad && (
          <MensajeExito mensaje={mensajeSeguridad} onClose={() => setMensajeSeguridad("")} />
        )}

        {errorSeguridad && (
          <div className="dark:bg-danger-950/30 mb-6 flex items-start justify-between gap-4 rounded-2xl border border-danger-200 bg-danger-50 px-5 py-4 dark:border-danger-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger-500" />
              <p className="text-sm leading-6 text-danger-700 dark:text-danger-300">
                {errorSeguridad}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setErrorSeguridad("")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-danger-500 transition hover:bg-danger-100 dark:hover:bg-danger-900/40"
              aria-label="Cerrar alerta"
            >
              <X className="h-5 w-5" />
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

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-800 dark:bg-brand-950/30">
          <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-brand-600 dark:text-brand-300" />
          <p className="text-sm leading-6 text-brand-700 dark:text-brand-300">
            Utiliza una contraseña de mínimo 8 caracteres y evita compartir tus credenciales de
            acceso.
          </p>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-surface-100 pt-5 dark:border-surface-800 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={cancelarCambioContrasena}
            className="flex h-11 items-center justify-center rounded-xl border border-surface-300 bg-white px-6 text-sm font-semibold text-surface-600 transition hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:bg-surface-800"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={guardandoPassword}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-7 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            <ShieldCheck className="h-[17px] w-[17px]" />
            {guardandoPassword ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}

function MensajeExito({ mensaje, onClose }: { mensaje: string; onClose: () => void }) {
  return (
    <div className="dark:bg-success-950/30 mb-6 flex items-start justify-between gap-4 rounded-2xl border border-success-200 bg-success-50 px-5 py-4 dark:border-success-800">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-500" />
        <p className="text-sm leading-6 text-success-700 dark:text-success-300">{mensaje}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-success-500 transition hover:bg-success-100 dark:hover:bg-success-900/40"
        aria-label="Cerrar mensaje"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

const campoClases = "form-input";
