"use client";

export default function RecepcionistaNotificacionesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Notificaciones</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Alertas y avisos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Las notificaciones relevantes para recepción aparecerán aquí.</p>
        </div>

        <div className="mt-6 rounded-[24px] border border-dashed border-slate-300/80 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Sin notificaciones nuevas</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No hay avisos pendientes por el momento.</p>
        </div>
      </section>
    </div>
  );
}
