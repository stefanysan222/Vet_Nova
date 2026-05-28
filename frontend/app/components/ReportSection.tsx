export default function ReportSection() {
  return (
    <section className="mx-auto mt-12 max-w-6xl rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-xl shadow-slate-200/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Reporte y contacto</p>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Levanta un reporte o solicita asistencia</h2>
          <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
            Si identificas alguna incidencia en el sistema o necesitas ayuda, completa el formulario y nuestro equipo interno te contactará.
          </p>

          <div className="space-y-4 rounded-3xl bg-slate-50 p-6 dark:bg-slate-900">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Contacto de prueba</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">soporte@vetnova.test</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">+57 300 123 4567</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Dirección</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Calle Falsa 123, Bogotá, Colombia</p>
            </div>
          </div>
        </div>

        <form className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <span>Nombre completo</span>
            <input type="text" placeholder="Ej. Juan Pérez" className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <span>Correo electrónico</span>
            <input type="email" placeholder="correo@ejemplo.com" className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <span>Tipo de reporte</span>
            <select className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <option>Incidencia técnica</option>
              <option>Problema con pacientes</option>
              <option>Solicitud de capacitación</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <span>Mensaje</span>
            <textarea placeholder="Describe el problema o la solicitud" rows={4} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          <button type="button" className="inline-flex w-full items-center justify-center rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
            Enviar reporte
          </button>
        </form>
      </div>
    </section>
  );
}
