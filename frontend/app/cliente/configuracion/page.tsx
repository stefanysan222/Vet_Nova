"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { updateUsuario } from "@/lib/api/usuarios";
import { fetchPropietarioByUsuario, updatePropietario } from "@/lib/api/propietarios";
import type { Owner } from "@/lib/recepcionista/types";
import { useClienteProfile } from "../ClienteProfileContext";

type PerfilCliente = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
};

const EMPTY_PERFIL: PerfilCliente = { nombre: "", apellido: "", email: "", telefono: "" };

export default function ConfiguracionPage() {
  const user = getCurrentUser();
  const { perfil: perfilContexto, refrescar } = useClienteProfile();
  const [perfil, setPerfil] = useState<PerfilCliente>({ ...EMPTY_PERFIL, ...perfilContexto });
  const [perfilGuardado, setPerfilGuardado] = useState<PerfilCliente>({
    ...EMPTY_PERFIL,
    ...perfilContexto,
  });
  const [propietario, setPropietario] = useState<Owner | null>(null);
  const [mensaje, setMensaje] = useState("");

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

    setPerfil((actual) => ({
      ...actual,
      [name]: value,
    }));

    setMensaje("");
  };

  const guardarPerfil = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (propietario) {
      try {
        await updatePropietario({ ...propietario, phone: perfil.telefono });
      } catch {
        setMensaje("No se pudo guardar el teléfono. Intenta de nuevo más tarde.");
        return;
      }
    }

    if (user?.id) {
      try {
        await updateUsuario(Number(user.id), {
          nombre: `${perfil.nombre} ${perfil.apellido}`.trim(),
          email: perfil.email,
        });
      } catch {
        setMensaje("No se pudo guardar tu información personal. Intenta de nuevo más tarde.");
        return;
      }
    }

    await refrescar();
    setPerfilGuardado(perfil);
    setMensaje("Tu información personal fue actualizada correctamente.");
  };

  const cancelarCambios = () => {
    setPerfil(perfilGuardado);
    setMensaje("");
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
            <button type="submit" className="btn-primary">
              Guardar Cambios
            </button>
          </div>
        </form>

        <section className="admin-card p-7">
          <div className="mb-7 flex items-center gap-3">
            <LockIcon />
            <h2 className="text-section-title">Seguridad</h2>
          </div>

          <div className="max-w-[760px]">
            <PasswordField label="Contraseña Actual" />
            <div className="mt-5">
              <PasswordField label="Nueva Contraseña" />
            </div>
            <div className="mt-5">
              <PasswordField label="Confirmar Contraseña" />
            </div>
          </div>

          <div className="mt-7 flex justify-end gap-3">
            <button type="button" className="btn-secondary">
              Cancelar
            </button>
            <button type="button" className="btn-primary">
              Actualizar Contraseña
            </button>
          </div>
        </section>
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

function PasswordField({ label }: { label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-white">
        {label}
      </span>
      <input
        type="password"
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
