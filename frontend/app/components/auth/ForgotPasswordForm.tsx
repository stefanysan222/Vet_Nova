"use client";

import { type FormEvent, useState } from "react";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";
import { forgotPassword } from "../../../lib/auth";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!email.trim()) return "El correo es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Ingresa un correo válido.";
    return "";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    setError("");
    const outcome = await forgotPassword(email);
    switch (outcome) {
      case "rate-limited":
        setError("Demasiados intentos. Intenta de nuevo en unos minutos.");
        break;
      case "error":
        setError("No se pudo enviar el correo. Intenta de nuevo más tarde.");
        break;
      case "sent":
        setSent(true);
        break;
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-100 dark:bg-success-900/30">
          <svg
            className="h-7 w-7 text-success-600 dark:text-success-400"
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
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Correo enviado</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Si <span className="font-medium text-slate-700 dark:text-slate-200">{email}</span> tiene
            una cuenta, recibirás un enlace para restablecer tu contraseña.
          </p>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          ¿No lo ves? Revisa tu carpeta de spam.
        </p>
        <a
          href="/login"
          className="inline-block text-sm font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          Volver al inicio de sesión
        </a>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="dark:bg-danger-950 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-900 dark:text-danger-400"
        >
          {error}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-1.5"
      >
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Correo electrónico
        </label>
        <motion.div
          animate={focused ? { scale: 1.01 } : { scale: 1 }}
          transition={{ duration: 0.15 }}
          className="relative"
        >
          <Mail
            className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focused ? "text-brand-500" : "text-slate-400"}`}
          />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="tucorreo@ejemplo.com"
            className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 dark:text-white dark:placeholder-slate-500 ${
              error
                ? "dark:bg-danger-950/30 border-danger-400 bg-danger-50 dark:border-danger-500"
                : focused
                  ? "border-brand-400 bg-brand-50/40 ring-2 ring-brand-100 dark:border-brand-500 dark:bg-brand-950/20 dark:ring-brand-900/40"
                  : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60"
            }`}
          />
        </motion.div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-brand-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
              />
              Enviando...
            </span>
          ) : (
            "Enviar enlace"
          )}
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-slate-500 dark:text-slate-400"
      >
        ¿Recordaste tu contraseña?{" "}
        <a
          href="/login"
          className="font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          Iniciar sesión
        </a>
      </motion.p>
    </form>
  );
}
