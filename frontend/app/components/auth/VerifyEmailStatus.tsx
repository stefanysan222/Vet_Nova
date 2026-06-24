"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyEmail } from "../../../lib/auth";
import { useAuth } from "@/lib/auth-context";

function getDashboardRoute(role: string) {
  if (role === "Administrador") return "/admin";
  if (role === "Veterinario") return "/veterinario";
  if (role === "SuperAdministrador") return "/super-admin";
  return "/cliente";
}

export default function VerifyEmailStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { refresh } = useAuth();
  const [status, setStatus] = useState<"loading" | "ok" | "error">(token ? "loading" : "error");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let activo = true;
    verifyEmail(token).then(async (result) => {
      if (!activo) return;
      if (result.error || !result.user) {
        setError(result.error ?? "El enlace de confirmación es inválido o ha expirado.");
        setStatus("error");
        return;
      }
      setStatus("ok");
      await refresh();
      setTimeout(() => router.push(getDashboardRoute(result.user!.role)), 1800);
    });
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Confirmando tu correo...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-4 text-center">
        <div className="dark:bg-danger-950/30 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-50 text-danger-600 dark:text-danger-400">
          <XCircle className="h-6 w-6" />
        </div>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          {error ?? "El enlace de confirmación no es válido."}
        </p>
        <a
          href="/login"
          className="inline-block text-sm font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
        >
          Volver a iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 text-center"
    >
      <div className="dark:bg-success-950/30 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-success-50 text-success-600 dark:text-success-400">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">
        Correo confirmado correctamente
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">Redirigiendo a tu panel...</p>
    </motion.div>
  );
}
