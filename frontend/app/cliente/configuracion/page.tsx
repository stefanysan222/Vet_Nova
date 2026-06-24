"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { User, Lock, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api/client";
import { cambiarClinica } from "@/lib/auth";
import { updateUsuario } from "@/lib/api/usuarios";
import { fetchPropietarioByUsuario, updatePropietario } from "@/lib/api/propietarios";
import { fetchClinicasActivas, type ClinicaActiva } from "@/lib/api/clinicas";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import type { Owner } from "@/lib/recepcionista/types";
import { useClienteProfile } from "../ClienteProfileContext";

type PerfilCliente = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
};

const EMPTY_PERFIL: PerfilCliente = { nombre: "", apellido: "", email: "", telefono: "" };

type PasswordForm = { currentPassword: string; newPassword: string; confirmPassword: string };
const EMPTY_PWD: PasswordForm = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function ConfiguracionPage() {
  const { user, refresh } = useAuth();
  const { perfil: perfilContexto, refrescar } = useClienteProfile();
  const [perfil, setPerfil] = useState<PerfilCliente>({ ...EMPTY_PERFIL, ...perfilContexto });
  const [perfilGuardado, setPerfilGuardado] = useState<PerfilCliente>({
    ...EMPTY_PERFIL,
    ...perfilContexto,
  });
  const [propietario, setPropietario] = useState<Owner | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [mensajeEsError, setMensajeEsError] = useState(false);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  const [pwd, setPwd] = useState<PasswordForm>(EMPTY_PWD);
  const [mensajePwd, setMensajePwd] = useState("");
  const [errorPwd, setErrorPwd] = useState("");
  const [guardandoPwd, setGuardandoPwd] = useState(false);

  const [clinicas, setClinicas] = useState<ClinicaActiva[]>([]);
  const [clinicaSeleccionada, setClinicaSeleccionada] = useState<ClinicaActiva | null>(null);
  const [mensajeClinica, setMensajeClinica] = useState("");
  const [errorClinica, setErrorClinica] = useState("");
  const [cambiandoClinica, setCambiandoClinica] = useState(false);

  useEffect(() => {
    fetchClinicasActivas()
      .then(setClinicas)
      .catch(() => {});
  }, []);

  const confirmarCambioClinica = async () => {
    if (!clinicaSeleccionada) return;
    setCambiandoClinica(true);
    setErrorClinica("");
    try {
      await cambiarClinica(clinicaSeleccionada.slug);
      await refresh();
      setMensajeClinica(`Tu cuenta ahora pertenece a ${clinicaSeleccionada.nombre}.`);
      setClinicaSeleccionada(null);
    } catch (err) {
      setErrorClinica(err instanceof Error ? err.message : "No se pudo cambiar de veterinaria.");
      setClinicaSeleccionada(null);
    } finally {
      setCambiandoClinica(false);
    }
  };

  useEffect(() => {
    // Sincroniza el formulario cuando llega el perfil real desde /auth/me
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPerfil((actual) => ({ ...actual, ...perfilContexto }));
    setPerfilGuardado((actual) => ({ ...actual, ...perfilContexto }));
  }, [perfilContexto]);

  // El teléfono se persiste en el backend (propietarios)
  useEffect(() => {
    const uid = user?.id ? Number(user.id) : undefined;
    if (!uid) return;
    fetchPropietarioByUsuario(uid)
      .then((owner) => {
        if (!owner) return;
        setPropietario(owner);
        setPerfil((actual) => ({ ...actual, telefono: owner.phone }));
        setPerfilGuardado((actual) => ({ ...actual, telefono: owner.phone }));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actualizarCampo = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPerfil((actual) => ({ ...actual, [name]: value }));
    setMensaje("");
    setMensajeEsError(false);
  };

  const guardarPerfil = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGuardandoPerfil(true);
    setMensajeEsError(false);

    if (propietario) {
      try {
        await updatePropietario({ ...propietario, phone: perfil.telefono });
      } catch {
        setMensajeEsError(true);
        setMensaje("No se pudo guardar el teléfono. Intenta de nuevo más tarde.");
        setGuardandoPerfil(false);
        return;
      }
    }

    if (user?.id) {
      try {
        await updateUsuario(Number(user.id), {
          nombre: `${perfil.nombre} ${perfil.apellido}`.trim(),
          email: perfil.email,
        });
      } catch (err) {
        setMensajeEsError(true);
        setMensaje(
          err instanceof Error
            ? err.message
            : "No se pudo guardar tu información personal. Intenta de nuevo más tarde.",
        );
        setGuardandoPerfil(false);
        return;
      }
    }

    await refrescar();
    setPerfilGuardado(perfil);
    setMensajeEsError(false);
    setMensaje("Tu información personal fue actualizada correctamente.");
    setGuardandoPerfil(false);
  };

  const cancelarCambios = () => {
    setPerfil(perfilGuardado);
    setMensaje("");
    setMensajeEsError(false);
  };

  const cambiarPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorPwd("");
    setMensajePwd("");

    if (pwd.newPassword.length < 8) {
      setErrorPwd("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (pwd.newPassword !== pwd.confirmPassword) {
      setErrorPwd("Las contraseñas no coinciden.");
      return;
    }

    if (!user?.id) return;

    setGuardandoPwd(true);
    try {
      await api.put(`/usuarios/${user.id}`, {
        password: pwd.newPassword,
        currentPassword: pwd.currentPassword,
      });
      setMensajePwd("Contraseña actualizada correctamente.");
      setPwd(EMPTY_PWD);
    } catch (err) {
      setErrorPwd(err instanceof Error ? err.message : "No se pudo actualizar la contraseña.");
    } finally {
      setGuardandoPwd(false);
    }
  };

  return (
    <div className="admin-page h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-page-title">Configuración</h1>
        <p className="text-subtitle mt-2">Administra tu información personal y seguridad</p>
      </div>

      <div className="max-w-[1100px] space-y-7">
        <form onSubmit={guardarPerfil} className="admin-card p-7">
          <div className="mb-7 flex items-center gap-3">
            <User className="h-[22px] w-[22px] text-slate-800 dark:text-white" />
            <h2 className="text-section-title">Información Personal</h2>
          </div>

          {mensaje && (
            <div
              className={
                mensajeEsError
                  ? "mb-7 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-400"
                  : "mb-7 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm font-medium text-success-700 dark:border-success-800 dark:bg-success-900/30 dark:text-success-400"
              }
            >
              {mensaje}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Nombre" name="nombre" value={perfil.nombre} onChange={actualizarCampo} />
            <Field
              label="Apellido"
              name="apellido"
              value={perfil.apellido}
              onChange={actualizarCampo}
            />
          </div>

          <div className="mt-5">
            <Field
              label="Email"
              name="email"
              type="email"
              value={perfil.email}
              onChange={actualizarCampo}
            />
          </div>

          <div className="mt-5">
            <Field
              label="Teléfono"
              name="telefono"
              type="tel"
              value={perfil.telefono}
              onChange={actualizarCampo}
            />
          </div>

          <div className="mt-7 flex justify-end gap-3">
            <button type="button" onClick={cancelarCambios} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={guardandoPerfil} className="btn-primary">
              {guardandoPerfil ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>

        <form onSubmit={cambiarPassword} className="admin-card p-7">
          <div className="mb-7 flex items-center gap-3">
            <Lock className="h-[22px] w-[22px] text-slate-800 dark:text-white" />
            <h2 className="text-section-title">Seguridad</h2>
          </div>

          {mensajePwd && (
            <div className="mb-5 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm font-medium text-success-700 dark:border-success-800 dark:bg-success-900/30 dark:text-success-400">
              {mensajePwd}
            </div>
          )}
          {errorPwd && (
            <div className="mb-5 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-400">
              {errorPwd}
            </div>
          )}

          <div className="max-w-[760px]">
            <PasswordField
              label="Contraseña Actual"
              name="currentPassword"
              value={pwd.currentPassword}
              onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))}
            />
            <div className="mt-5">
              <PasswordField
                label="Nueva Contraseña"
                name="newPassword"
                value={pwd.newPassword}
                onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
              />
            </div>
            <div className="mt-5">
              <PasswordField
                label="Confirmar Contraseña"
                name="confirmPassword"
                value={pwd.confirmPassword}
                onChange={(e) => setPwd((p) => ({ ...p, confirmPassword: e.target.value }))}
              />
            </div>
          </div>

          <div className="mt-7 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setPwd(EMPTY_PWD);
                setErrorPwd("");
                setMensajePwd("");
              }}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" disabled={guardandoPwd} className="btn-primary">
              {guardandoPwd ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
          </div>
        </form>

        <div className="admin-card p-7">
          <div className="mb-2 flex items-center gap-3">
            <Building2 className="h-[22px] w-[22px] text-slate-800 dark:text-white" />
            <h2 className="text-section-title">Cambiar de veterinaria</h2>
          </div>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            Actualmente estás en <strong>{user?.clinicaNombre ?? "tu clínica"}</strong>. Si te
            mudaste o prefieres atender a tu mascota en otra veterinaria de VetNova, puedes migrar
            tu cuenta sin registrarte de nuevo: tu perfil y tus mascotas se mueven contigo.
          </p>

          {mensajeClinica && (
            <div className="mb-5 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm font-medium text-success-700 dark:border-success-800 dark:bg-success-900/30 dark:text-success-400">
              {mensajeClinica}
            </div>
          )}
          {errorClinica && (
            <div className="mb-5 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-400">
              {errorClinica}
            </div>
          )}

          <div className="max-w-[760px] space-y-2">
            {clinicas
              .filter((c) => c.nombre !== user?.clinicaNombre)
              .map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => {
                    setMensajeClinica("");
                    setErrorClinica("");
                    setClinicaSeleccionada(c);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-slate-700 dark:hover:border-brand-700 dark:hover:bg-brand-900/10"
                >
                  <span>
                    <span className="block text-sm font-semibold text-slate-800 dark:text-white">
                      {c.nombre}
                    </span>
                    {c.direccion && (
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        {c.direccion}
                      </span>
                    )}
                  </span>
                  <span className="btn-secondary !px-3 !py-1.5 text-xs">Migrar aquí</span>
                </button>
              ))}
            {clinicas.filter((c) => c.nombre !== user?.clinicaNombre).length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No hay otras veterinarias disponibles por ahora.
              </p>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!clinicaSeleccionada}
        title={`¿Cambiar a ${clinicaSeleccionada?.nombre}?`}
        description="Tu perfil y tus mascotas se moverán a esta veterinaria. El historial detallado de consultas y vacunas de tu clínica actual no se compartirá con la nueva (solo un resumen), pero tú seguirás viendo tu historial completo desde tu perfil en cualquier momento."
        confirmLabel={cambiandoClinica ? "Migrando..." : "Confirmar cambio"}
        variant="warning"
        onConfirm={confirmarCambioClinica}
        onCancel={() => setClinicaSeleccionada(null)}
      />
    </div>
  );
}

function Field({
  label,
  name,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  type?: "text" | "email" | "tel";
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-white">
        {label}
      </span>
      <input
        required
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="form-input"
      />
    </label>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-white">
        {label}
      </span>
      <input
        required
        type="password"
        name={name}
        value={value}
        onChange={onChange}
        placeholder="••••••••"
        className="form-input"
      />
    </label>
  );
}
