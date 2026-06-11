"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-50 px-6 dark:bg-surface-950">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-600 text-4xl font-bold text-white shadow-brand">
            404
          </div>
        </div>

        <h1 className="text-page-title">Página no encontrada</h1>

        <p className="text-subtitle mt-3">
          La dirección que buscas no existe o fue movida. Verifica la URL o regresa al inicio.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98]"
          >
            Ir al inicio
          </Link>
          <button
            onClick={() => history.back()}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-surface-300 bg-white px-6 text-sm font-semibold text-surface-600 transition hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:bg-surface-800"
          >
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
}
