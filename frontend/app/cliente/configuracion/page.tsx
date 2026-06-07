"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api/client";

const PROFILE_STORAGE_KEY = "vetnova_cliente_perfil";

type PerfilCliente = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
};

const EMPTY_PERFIL: PerfilCliente = { nombre: "", apellido: "", email: "", telefono: "" };

function cargarPerfilInicial(): PerfilCliente {
  if (typeof window === "undefined") return EMPTY_PERFIL;
  const user = getCurrentUser();
  const partes = (user?.name ?? "").trim().split(" ");
  const nombreJWT = partes[0] ?? "";
  const apellidoJWT = partes.slice(1).join(" ");
  const emailJWT = user?.email ?? "";

  const informacionGuardada = localStorage.getItem(PROFILE_STORAGE_KEY);

  if (!informacionGuardada) {
    return { nombre: nombreJWT, apellido: apellidoJWT, email: emailJWT, telefono: "" };
  }

  try {
    const datosGuardados = JSON.parse(informacionGuardada) as Partial<PerfilCliente>;
    const datosLimpios: PerfilCliente = {
      nombre: datosGuardados.nombre || nombreJWT,
      apellido: datosGuardados.apellido || apellidoJWT,
      email: datosGuardados.email || emailJWT,
      telefono: datosGuardados.telefono ?? "",
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(datosLimpios));
    return datosLimpios;
  } catch {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    return { nombre: nombreJWT, apellido: apellidoJWT, email: emailJWT, telefono: "" };
  }
}

type PasswordForm = { currentPassword: string; newPassword: string; confirmPassword: string };
const EMPTY_PWD: PasswordForm = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function ConfiguracionPage() {
  const [perfil, setPerfil] = useState<PerfilCliente>(cargarPerfilInicial);
  const [perfilGuardado, setPerfilGuardado] = useState<PerfilCliente>(cargarPerfilInicial);
  const [mensaje, setMensaje] = useState("");
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  const [pwd, setPwd] = useState<PasswordForm>(EMPTY_PWD);
  const [mensajePwd, setMensajePwd] = useState("");
  const [errorPwd, setErrorPwd] = useState("");
  const [guardandoPwd, setGuardandoPwd] = useState(false);

  const actualizarCampo = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPerfil((actual) => ({ ...actual, [name]: value }));
    setMensaje("");
  };

  const guardarPerfil = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGuardandoPerfil(true);
    const user = getCurrentUser();
    try {
      if (user?.id) {
        await api.put(`/usuarios/${user.id}`, {
          nombre: `${perfil.nombre} ${perfil.apellido}`.trim(),
          email: perfil.email,
        });
      }
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(perfil));
      setPerfilGuardado(perfil);
      setMensaje("Tu información personal fue actualizada correctamente.");
      window.dispatchEvent(new Event("vetnova-profile-updated"));
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : "No se pudo guardar la información.");
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const cancelarCambios = () => {
    setPerfil(perfilGuardado);
    setMensaje("");
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

    const user = getCurrentUser();
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
            <UserIcon />
            <h2 className="text-section-title">Información Personal</h2>
          </div>

          {mensaje && (
            <div className="mb-7 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
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
            <LockIcon />
            <h2 className="text-section-title">Seguridad</h2>
          </div>

          {mensajePwd && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              {mensajePwd}
            </div>
          )}
          {errorPwd && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
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
            <button type="button" onClick={() => { setPwd(EMPTY_PWD); setErrorPwd(""); setMensajePwd(""); }} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={guardandoPwd} className="btn-primary">
              {guardandoPwd ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
          </div>
        </form>
      </div>
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
        className="h-[45px] w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-400/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400"
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
        className="h-[45px] w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-brand-400"
      />
    </label>
  );
}

function UserIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className="text-slate-800 dark:text-white"
    >
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />

      <path
        d="M5 20c0-3.5 2.9-6 7-6s7 2.5 7 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className="text-slate-800 dark:text-white"
    >
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" />

      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
