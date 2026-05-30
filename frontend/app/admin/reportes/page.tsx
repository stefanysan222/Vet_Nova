import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";

const summaryReports = [
  {
    title: "Total usuarios",
    value: "120",
    description: "Última semana: +15% con respecto al mes anterior.",
  },
  {
    title: "Veterinarios activos",
    value: "8",
    description: "Última semana: +5% gracias a nuevos registros.",
  },
  {
    title: "Recepcionistas",
    value: "5",
    description: "Actividad estable en la recepción de la clínica.",
  },
  {
    title: "Administradores",
    value: "2",
    description: "Usuarios con acceso al panel administrativo.",
  },
];

const dashboardEvents = [
  {
    title: "Nueva cita agendada",
    detail: "El cliente Ana Pérez reservó una consulta para Milo desde la pantalla de inicio.",
    time: "2 min atrás",
    type: "Citas",
  },
  {
    title: "Inventario bajo",
    detail: "Quedan menos de 10 unidades de alimento premium y es necesario reponer.",
    time: "12 min atrás",
    type: "Inventario",
  },
  {
    title: "Usuario registrado",
    detail: "Se agregó un nuevo recepcionista al sistema desde el panel de inicio.",
    time: "45 min atrás",
    type: "Usuarios",
  },
  {
    title: "Cita confirmada",
    detail: "La cita de Bella fue confirmada para el viernes a las 02:00 PM.",
    time: "1 hora atrás",
    type: "Citas",
  },
];

export default function ReportesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar />
        <div className="lg:order-2">
          <Navbar />
          <main className="mx-auto max-w-7xl px-6 pb-12 pt-6 lg:px-10">
            <section className="rounded-[2rem] border border-slate-200/60 bg-white/95 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-950">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Reportes</p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Reportes</h1>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
                    Visualiza indicadores clave, rendimiento mensual y métricas de operación.
                  </p>
                </div>
                <button className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(37,99,235,0.22)] transition duration-300 hover:bg-blue-700">
                  Ver reportes
                </button>
              </div>

              <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Reportes resumidos</h2>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Todas las métricas que ya aparecen en la pantalla de inicio, ahora agrupadas en un solo lugar.</p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {summaryReports.map((report) => (
                        <div key={report.title} className="rounded-3xl border border-slate-200/70 bg-white p-5 dark:border-slate-700 dark:bg-slate-950">
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{report.title}</p>
                          <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{report.value}</p>
                          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{report.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Eventos del dashboard</h2>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Registros detallados de lo que ocurrió en la pantalla de inicio.</p>
                    <div className="mt-6 space-y-4">
                      {dashboardEvents.map((event) => (
                        <div key={event.title} className="rounded-3xl border border-slate-200/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-base font-semibold text-slate-900 dark:text-white">{event.title}</p>
                              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{event.detail}</p>
                            </div>
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                              {event.type}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{event.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Detalle de reportes</h2>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Expande cualquiera de los reportes del dashboard para ver los datos clave.</p>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-950">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tendencia de citas</p>
                      <p className="mt-3 text-base leading-6 text-slate-700 dark:text-slate-300">El número de citas ha crecido un 10% en los últimos 30 días, con un pico de 120 citas en junio.</p>
                    </div>
                    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-950">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Distribución de servicios</p>
                      <p className="mt-3 text-base leading-6 text-slate-700 dark:text-slate-300">Consultas sigue siendo el servicio dominante con 40%, seguido por estética y urgencias.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
