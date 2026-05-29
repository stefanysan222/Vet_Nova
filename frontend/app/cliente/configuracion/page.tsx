"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const PROFILE_STORAGE_KEY = "vetnova_cliente_perfil";

type PerfilCliente = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
};

const perfilInicial: PerfilCliente = {
  nombre: "Juan",
  apellido: "Pérez",
  email: "usuario@vetnova.com",
  telefono: "+52 555 1234 5678",
};

export default function ConfiguracionPage() {
  const [perfil, setPerfil] = useState<PerfilCliente>(perfilInicial);
  const [perfilGuardado, setPerfilGuardado] =
    useState<PerfilCliente>(perfilInicial);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const informacionGuardada = localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!informacionGuardada) return;

    try {
      const datosGuardados = JSON.parse(
        informacionGuardada
      ) as Partial<PerfilCliente>;

      const datosLimpios: PerfilCliente = {
        nombre: datosGuardados.nombre ?? perfilInicial.nombre,
        apellido: datosGuardados.apellido ?? perfilInicial.apellido,
        email: datosGuardados.email ?? perfilInicial.email,
        telefono: datosGuardados.telefono ?? perfilInicial.telefono,
      };

      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(datosLimpios)
      );

      setPerfil(datosLimpios);
      setPerfilGuardado(datosLimpios);

      window.dispatchEvent(new Event("vetnova-profile-updated"));
    } catch {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  }, []);

  const actualizarCampo = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setPerfil((actual) => ({
      ...actual,
      [name]: value,
    }));

    setMensaje("");
  };

  const guardarPerfil = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(perfil));
    setPerfilGuardado(perfil);
    setMensaje("Tu información personal fue actualizada correctamente.");

    window.dispatchEvent(new Event("vetnova-profile-updated"));
  };

  const cancelarCambios = () => {
    setPerfil(perfilGuardado);
    setMensaje("");
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold leading-none text-[#10213A] dark:text-white">
          Configuración
        </h1>

        <p className="mt-4 text-[16px] text-[#64748B] dark:text-[#94A3B8]">
          Administra tu información personal y seguridad
        </p>
      </div>

      <div className="max-w-[1100px] space-y-7">
        <form
          onSubmit={guardarPerfil}
          className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm dark:border-[#334155] dark:bg-[#111827]"
        >
          <div className="mb-7 flex items-center gap-3">
            <UserIcon />

            <h2 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
              Información Personal
            </h2>
          </div>

          {mensaje && (
            <div className="mb-7 rounded-xl border border-[#B7E5C4] bg-[#EDF9F0] px-4 py-3 text-[14px] font-medium text-[#008B35] dark:border-[#166534] dark:bg-[#112C1D] dark:text-[#86EFAC]">
              {mensaje}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field
              label="Nombre"
              name="nombre"
              value={perfil.nombre}
              onChange={actualizarCampo}
            />

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
            <button
              type="button"
              onClick={cancelarCambios}
              className="h-[45px] rounded-xl border border-[#CBD5E1] bg-white px-5 text-[15px] font-semibold text-[#10213A] transition-all hover:bg-[#F8FAFD] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:hover:bg-[#1E293B]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="h-[45px] rounded-xl bg-[#2F6BFF] px-5 text-[15px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#2457D6] hover:shadow-[0_10px_20px_rgba(47,107,255,0.28)]"
            >
              Guardar Cambios
            </button>
          </div>
        </form>

        <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
          <div className="mb-7 flex items-center gap-3">
            <LockIcon />

            <h2 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
              Seguridad
            </h2>
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
            <button
              type="button"
              className="h-[45px] rounded-xl border border-[#CBD5E1] bg-white px-5 text-[15px] font-semibold text-[#10213A] transition-all hover:bg-[#F8FAFD] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:hover:bg-[#1E293B]"
            >
              Cancelar
            </button>

            <button
              type="button"
              className="h-[45px] rounded-xl bg-[#2F6BFF] px-5 text-[15px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#2457D6] hover:shadow-[0_10px_20px_rgba(47,107,255,0.28)]"
            >
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
      <span className="mb-2 block text-[15px] font-semibold text-[#10213A] dark:text-white">
        {label}
      </span>

      <input
        required
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="h-[45px] w-full rounded-lg border border-[#CBD5E1] bg-white px-4 text-[15px] text-[#10213A] outline-none transition-all focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/10 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:focus:border-[#2F6BFF]"
      />
    </label>
  );
}

function PasswordField({ label }: { label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[15px] font-semibold text-[#10213A] dark:text-white">
        {label}
      </span>

      <input
        type="password"
        placeholder="••••••••"
        className="h-[45px] w-full rounded-lg border border-[#CBD5E1] bg-white px-4 text-[15px] text-[#10213A] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/10 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:placeholder:text-[#64748B] dark:focus:border-[#2F6BFF]"
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
      className="text-[#10213A] dark:text-white"
    >
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="2"
      />

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
      className="text-[#10213A] dark:text-white"
    >
      <rect
        x="4"
        y="10"
        width="16"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}