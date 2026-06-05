"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Button from "../Button";
import GoogleAuthButton from "./GoogleAuthButton";
import { loginUser, loginOrRegisterGoogle, setToken } from "../../../lib/auth";

const initialState = {
  email: "",
  password: "",
  remember: false,
};

export default function LoginForm() {
  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

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

  const getDashboardRoute = (role: string) => {
    if (role === "Administrador") return "/admin";
    if (role === "Veterinario") return "/veterinario";
    return "/cliente";
  };

  const handleGoogleSuccess = async (profile: { name: string; email: string; picture?: string }) => {
    setLoading(true);
    setSubmitError(null);
    const result = await loginOrRegisterGoogle(profile);
    setLoading(false);
    if (result.error) {
      setSubmitError(result.error);
      return;
    }
    if (result.token && result.user) {
      setToken(result.token);
      router.push(getDashboardRoute(result.user.role));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setSubmitError(null);
    const result = await loginUser(formData.email, formData.password);
    setLoading(false);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }

    setErrors({});
    if (result.token && result.user) {
      setToken(result.token);
      router.push(getDashboardRoute(result.user.role));
    }
  };

  const inputBase =
    "w-full rounded-xl border border-surface-200 bg-white py-3 text-sm text-surface-900 outline-none transition placeholder:text-surface-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-surface-700 dark:bg-surface-900 dark:text-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <GoogleAuthButton label="Continuar con Google" onSuccess={handleGoogleSuccess} />

      <div className="relative flex items-center gap-3 text-xs text-surface-400">
        <span className="h-px flex-1 bg-surface-200 dark:bg-surface-700" />
        o con correo electrónico
        <span className="h-px flex-1 bg-surface-200 dark:bg-surface-700" />
      </div>

      {submitError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {submitError}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300" htmlFor="email">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(event) => handleChange("email", event.target.value)}
            className={`${inputBase} pl-10 pr-4`}
            placeholder="tucorreo@ejemplo.com"
          />
        </div>
        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300" htmlFor="password">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(event) => handleChange("password", event.target.value)}
            className={`${inputBase} pl-10 pr-10`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((c) => !c)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 transition hover:text-surface-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
          <input
            type="checkbox"
            checked={formData.remember}
            onChange={(event) => handleChange("remember", event.target.checked)}
            className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
          />
          Recordarme
        </label>
        <a href="#" className="text-sm font-medium text-brand-600 transition hover:text-brand-700">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <Button type="submit" disabled={loading} className="w-full justify-center py-3">
        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>

      <p className="text-center text-sm text-surface-500 dark:text-surface-400">
        ¿Aún no tienes cuenta?{" "}
        <a href="/register" className="font-semibold text-brand-600 transition hover:text-brand-700">
          Crear cuenta
        </a>
      </p>
    </form>
  );
}
