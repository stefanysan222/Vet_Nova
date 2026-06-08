"use client";

import { type FormEvent, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "../../../lib/auth";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!password) e.password = "La contraseña es obligatoria.";
    else if (password.length < 8) e.password = "Mínimo 8 caracteres.";
    if (!confirm) e.confirm = "Confirma tu contraseña.";
    else if (confirm !== password) e.confirm = "Las contraseñas no coinciden.";
    return e;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (!token) {
      setSubmitError("El enlace de recuperación no es válido.");
      return;
    }
    setLoading(true);
    setSubmitError("");
    const result = await resetPassword(token, password);
    if (result.ok) {
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } else {
      setSubmitError(result.message ?? "Error al restablecer la contraseña.");
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <svg
            className="h-7 w-7 text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          El enlace de recuperación no es válido o ha expirado.
        </p>
        <a
          href="/forgot-password"
          className="inline-block text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Solicitar uno nuevo
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <svg
            className="h-7 w-7 text-emerald-600 dark:text-emerald-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Contraseña restablecida
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Redirigiendo al inicio de sesión...
          </p>
        </div>
      </motion.div>
    );
  }

  const inputClass = (field: string) =>
    `w-full rounded-xl border py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 dark:text-white dark:placeholder-slate-500 ${
      errors[field]
        ? "border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30"
        : focused === field
          ? "border-blue-400 bg-blue-50/50 ring-2 ring-blue-100 dark:border-blue-500 dark:bg-blue-950/20 dark:ring-blue-900/40"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
        >
          {submitError}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-1.5"
      >
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Nueva contraseña
        </label>
        <motion.div
          animate={focused === "password" ? { scale: 1.01 } : { scale: 1 }}
          transition={{ duration: 0.15 }}
          className="relative"
        >
          <Lock
            className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focused === "password" ? "text-blue-500" : "text-slate-400"}`}
          />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((c) => ({ ...c, password: "" }));
            }}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            className={`${inputClass("password")} pl-10 pr-10`}
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={() => setShowPassword((c) => !c)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </motion.button>
        </motion.div>
        {errors.password && (
          <motion.p
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-red-600 dark:text-red-400"
          >
            {errors.password}
          </motion.p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-1.5"
      >
        <label
          htmlFor="confirm"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Confirmar contraseña
        </label>
        <motion.div
          animate={focused === "confirm" ? { scale: 1.01 } : { scale: 1 }}
          transition={{ duration: 0.15 }}
          className="relative"
        >
          <Lock
            className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focused === "confirm" ? "text-blue-500" : "text-slate-400"}`}
          />
          <input
            id="confirm"
            type={showPassword ? "text" : "password"}
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setErrors((c) => ({ ...c, confirm: "" }));
            }}
            onFocus={() => setFocused("confirm")}
            onBlur={() => setFocused(null)}
            placeholder="Repite la nueva contraseña"
            autoComplete="new-password"
            className={`${inputClass("confirm")} pl-10 pr-4`}
          />
        </motion.div>
        {errors.confirm && (
          <motion.p
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-red-600 dark:text-red-400"
          >
            {errors.confirm}
          </motion.p>
        )}
        {password && confirm && !errors.confirm && (
          <p
            className={`text-xs font-medium ${password === confirm ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
          >
            {password === confirm
              ? "✓ Las contraseñas coinciden"
              : "✗ Las contraseñas no coinciden"}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
              />
              Restableciendo...
            </span>
          ) : (
            "Restablecer contraseña"
          )}
        </motion.button>
      </motion.div>
    </form>
  );
}
