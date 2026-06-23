"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import GoogleAuthButton from "./GoogleAuthButton";
import { loginUser, loginOrRegisterGoogle, type ClinicaOpcion } from "../../../lib/auth";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "../ui/Toast";

const initialState = { email: "", password: "" };

const inputVariants = {
  rest: { scale: 1 },
  focus: { scale: 1.01, transition: { duration: 0.15 } },
};

export default function LoginForm() {
  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clinicOptions, setClinicOptions] = useState<ClinicaOpcion[] | null>(null);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState<string | null>(null);
  const router = useRouter();
  const { refresh } = useAuth();
  const { info } = useToast();

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((c) => ({ ...c, [field]: value }));
    setErrors((c) => ({ ...c, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.email.trim()) e.email = "El correo es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Ingresa un correo válido.";
    if (!formData.password) e.password = "La contraseña es obligatoria.";
    else if (formData.password.length < 8) e.password = "Mínimo 8 caracteres.";
    return e;
  };

  const getDashboardRoute = (role: string) => {
    if (role === "Administrador") return "/admin";
    if (role === "Veterinario") return "/veterinario";
    return "/cliente";
  };

  const notifyOtraClinica = (aviso?: { nombre: string; slug: string }) => {
    if (!aviso) return;
    info(
      `Ya tienes una cuenta en ${aviso.nombre}`,
      "Esta es una cuenta nueva e independiente. Tu historial de mascotas no se comparte entre clínicas.",
    );
  };

  const handleGoogleSuccess = async (data: { credential: string }) => {
    setLoading(true);
    setSubmitError(null);
    const result = await loginOrRegisterGoogle(data);
    setLoading(false);
    if (result.error) {
      setSubmitError(result.error);
      return;
    }
    if (result.requiresClinicSelection) {
      setPendingGoogleCredential(data.credential);
      setClinicOptions(result.clinicas ?? []);
      return;
    }
    if (result.user) {
      notifyOtraClinica(result.avisoOtraClinica);
      await refresh();
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
    if (result.requiresClinicSelection) {
      setClinicOptions(result.clinicas ?? []);
      return;
    }
    setErrors({});
    if (result.user) {
      await refresh();
      router.push(getDashboardRoute(result.user.role));
    }
  };

  const handleSelectClinica = async (clinica: ClinicaOpcion) => {
    setLoading(true);
    setSubmitError(null);
    const result = pendingGoogleCredential
      ? await loginOrRegisterGoogle({
          credential: pendingGoogleCredential,
          clinicaSlug: clinica.slug,
        })
      : await loginUser(formData.email, formData.password, clinica.slug);
    setLoading(false);
    if (result.error) {
      setSubmitError(result.error);
      return;
    }
    if (result.user) {
      setClinicOptions(null);
      setPendingGoogleCredential(null);
      notifyOtraClinica(result.avisoOtraClinica);
      await refresh();
      router.push(getDashboardRoute(result.user.role));
    }
  };

  const inputBase = (field: string) =>
    `w-full rounded-xl border py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 dark:text-white dark:placeholder-slate-500 ${
      errors[field]
        ? "border-danger-400 bg-danger-50 dark:border-danger-500 dark:bg-danger-950/30"
        : focused === field
          ? "border-brand-400 bg-brand-50/40 ring-2 ring-brand-100 dark:border-brand-500 dark:bg-brand-950/20 dark:ring-brand-900/40"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60"
    }`;

  if (clinicOptions) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-300">
            <Building2 className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Tienes una cuenta en varias clínicas. Selecciona con cuál deseas iniciar sesión.
          </p>
        </div>

        {submitError && (
          <div className="dark:bg-danger-950 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-900 dark:text-danger-400">
            {submitError}
          </div>
        )}

        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {clinicOptions.map((clinica) => (
            <button
              key={clinica.slug}
              type="button"
              disabled={loading}
              onClick={() => handleSelectClinica(clinica)}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-brand-700 dark:hover:bg-brand-950/20"
            >
              <Building2 className="h-4 w-4 shrink-0 text-brand-500" />
              {clinica.nombre}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setClinicOptions(null);
            setPendingGoogleCredential(null);
            setSubmitError(null);
          }}
          className="block w-full text-center text-sm font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GoogleAuthButton onSuccess={handleGoogleSuccess} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="relative flex items-center gap-3 text-xs text-slate-400"
      >
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        o con correo electrónico
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </motion.div>

      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="dark:bg-danger-950 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-900 dark:text-danger-400"
        >
          {submitError}
        </motion.div>
      )}

      {/* Email */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-1.5"
      >
        <label
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          htmlFor="email"
        >
          Correo electrónico
        </label>
        <motion.div
          variants={inputVariants}
          animate={focused === "email" ? "focus" : "rest"}
          className="relative"
        >
          <Mail
            className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focused === "email" ? "text-brand-500" : "text-slate-400"}`}
          />
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            className={`${inputBase("email")} pl-10 pr-4`}
            placeholder="tucorreo@ejemplo.com"
          />
        </motion.div>
        {errors.email && (
          <motion.p
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-danger-600 dark:text-danger-400"
          >
            {errors.email}
          </motion.p>
        )}
      </motion.div>

      {/* Password */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-1.5"
      >
        <label
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          htmlFor="password"
        >
          Contraseña
        </label>
        <motion.div
          variants={inputVariants}
          animate={focused === "password" ? "focus" : "rest"}
          className="relative"
        >
          <Lock
            className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focused === "password" ? "text-brand-500" : "text-slate-400"}`}
          />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            className={`${inputBase("password")} pl-10 pr-10`}
            placeholder="••••••••"
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={() => setShowPassword((c) => !c)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </motion.button>
        </motion.div>
        {errors.password && (
          <motion.p
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-danger-600 dark:text-danger-400"
          >
            {errors.password}
          </motion.p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-end"
      >
        <a
          href="/forgot-password"
          className="text-sm font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          className="relative w-full overflow-hidden rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-brand-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-brand-600 dark:hover:bg-brand-500"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
              />
              Iniciando sesión...
            </span>
          ) : (
            "Iniciar sesión"
          )}
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm text-slate-500 dark:text-slate-400"
      >
        ¿Aún no tienes cuenta?{" "}
        <a
          href="/register"
          className="font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
        >
          Crear cuenta
        </a>
      </motion.p>
    </form>
  );
}
