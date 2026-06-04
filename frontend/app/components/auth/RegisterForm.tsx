"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, UserCircle } from "lucide-react";
import Button from "../Button";
import GoogleAuthButton from "./GoogleAuthButton";
import { registerUser, loginOrRegisterGoogle, setToken } from "../../../lib/auth";

const initialState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

export default function RegisterForm() {
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
    if (!formData.name.trim()) nextErrors.name = "El nombre completo es obligatorio.";
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
    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Confirma tu contraseña.";
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = "Las contraseñas no coinciden.";
    }
    if (!formData.acceptTerms) nextErrors.acceptTerms = "Debes aceptar los términos.";
    return nextErrors;
  };

  const getDashboardRoute = (role: string) => {
    if (role === "Administrador") return "/admin";
    if (role === "Veterinario") return "/veterinario";
    if (role === "Recepcionista") return "/recepcionista";
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
    const result = await registerUser({
      nombre: formData.name,
      email: formData.email,
      password: formData.password,
      rol: "Cliente",
    });
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

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[2rem] border border-slate-200/70 bg-slate-50 p-6 shadow-sm shadow-slate-200/50"
      noValidate
    >
      <GoogleAuthButton label="Registrarse con Google" onSuccess={handleGoogleSuccess} />
      <div className="relative flex items-center justify-center text-xs text-slate-500">
        <span className="absolute left-0 right-0 h-px bg-slate-200"></span>
        <span className="relative z-10 px-3 bg-slate-50">o crear cuenta manual</span>
      </div>

      {submitError ? <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{submitError}</p> : null}

      <div className="grid gap-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="name">
            Nombre completo
          </label>
          <div className="relative">
            <UserCircle className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(event) => handleChange("name", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Nombre completo"
            />
          </div>
          {errors.name ? <p className="text-xs text-rose-600">{errors.name}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="email">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(event) => handleChange("email", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="tucorreo@ejemplo.com"
            />
          </div>
          {errors.email ? <p className="text-xs text-rose-600">{errors.email}</p> : null}
        </div>
      </div>

      <div className="grid gap-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="password">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(event) => handleChange("password", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-10 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Contraseña segura"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password ? <p className="text-xs text-rose-600">{errors.password}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="confirmPassword">
            Confirmar contraseña
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(event) => handleChange("confirmPassword", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-10 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Repite la contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword ? <p className="text-xs text-rose-600">{errors.confirmPassword}</p> : null}
        </div>
      </div>

      <div className="grid gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <label className="inline-flex items-start gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(event) => handleChange("acceptTerms", event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Acepto los términos
          </label>
        </div>
      </div>
      {errors.acceptTerms ? <p className="text-xs text-rose-600">{errors.acceptTerms}</p> : null}

      <div className="space-y-2">
        <Button type="submit" disabled={loading} className="w-full justify-center py-2.5 text-sm font-semibold">
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </div>

      <div className="text-center text-xs text-slate-600">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="font-semibold text-blue-600 transition hover:text-blue-700">
          Iniciar sesión
        </a>
      </div>
    </form>
  );
}
