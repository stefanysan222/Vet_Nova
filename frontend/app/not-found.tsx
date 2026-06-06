"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F7FB] px-6 dark:bg-[#0F172A]">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-600 text-4xl font-bold text-white shadow-brand">
            404
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#10213A] dark:text-white">Página no encontrada</h1>

        <p className="mt-3 text-[15px] leading-6 text-[#64748B] dark:text-[#94A3B8]">
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
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white px-6 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#CBD5E1] dark:hover:bg-[#273549]"
          >
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
}
