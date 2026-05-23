"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Button from "../Button";

const initialState = {
  email: "",
  password: "",
  remember: false,
};

export default function LoginForm() {
  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      nextErrors.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Ingresa un correo válido.";
    }

    if (!formData.password) {
      nextErrors.password = "La contraseña es obligatoria.";
    } else if (formData.password.length < 6) {
      nextErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-[2rem] border border-slate-200/70 bg-slate-50 p-8 shadow-sm shadow-slate-200/50"
      noValidate
    >
      <div className="space-y-4">
        <label className="text-base font-semibold text-slate-700" htmlFor="email">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(event) => handleChange("email", event.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-white pl-16 pr-7 py-6 text-lg text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="tucorreo@ejemplo.com"
          />
        </div>
        {errors.email ? <p className="text-sm text-rose-600">{errors.email}</p> : null}
      </div>

      <div className="space-y-4">
        <label className="text-base font-semibold text-slate-700" htmlFor="password">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(event) => handleChange("password", event.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-white pl-16 pr-7 py-6 text-lg text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Contraseña segura"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password ? <p className="text-sm text-rose-600">{errors.password}</p> : null}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={formData.remember}
            onChange={(event) => handleChange("remember", event.target.checked)}
            className="h-5 w-5 rounded-lg border border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Recordarme
        </label>
        <a href="#" className="text-sm font-semibold text-blue-600 transition hover:text-blue-700">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <div className="space-y-4">
        <Button type="submit" className="w-full justify-center py-4 text-sm font-semibold">
          Iniciar sesión
        </Button>
      </div>

      <div className="text-center text-sm text-slate-600">
        ¿Aún no tienes cuenta?{' '}
        <a href="/register" className="font-semibold text-blue-600 transition hover:text-blue-700">
          Crear cuenta
        </a>
      </div>
    </form>
  );
}
