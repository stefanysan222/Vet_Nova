"use client";

import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";

export default function FacturacionPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar />
        <div className="lg:order-2">
          <Navbar />
          <main className="mx-auto max-w-7xl px-6 pb-12 pt-6 lg:px-10">
            <section className="rounded-[2rem] border border-slate-200/60 bg-white/95 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-950">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Facturación</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Gestión de facturas</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
                  Genera facturas, controla ingresos y mantén el seguimiento de pagos pendientes.
                </p>
              </div>

              <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-slate-200/70 bg-slate-50 py-16 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-slate-900 dark:text-white">Módulo en construcción</h2>
                <p className="mt-3 max-w-md text-center text-sm text-slate-600 dark:text-slate-400">
                  El módulo de facturación estará disponible próximamente. Aquí podrás generar, gestionar y hacer seguimiento de todas las facturas del sistema.
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
