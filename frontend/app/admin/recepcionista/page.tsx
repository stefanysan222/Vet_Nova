import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";

const receptionistSummary = [
  { title: "Propietarios", value: "86", description: "Clientes registrados asociados a mascotas." },
  { title: "Mascotas", value: "214", description: "Perros, gatos y otras mascotas activas." },
  { title: "Citas pendientes", value: "14", description: "Citas aún sin confirmar desde recepción." },
  { title: "Inventario bajo", value: "5", description: "Artículos que necesitan reposición urgente." },
];

const receptionistHighlights = [
  {
    label: "Última mascota registrada",
    value: "Milo",
    detail: "Perro Beagle asociado a Claudia Ríos, con foto subida desde recepción.",
  },
  {
    label: "Propietario nuevo",
    value: "Andrés Castillo",
    detail: "Registrado hoy con contacto listo para nuevas citas.",
  },
  {
    label: "Cita confirmada",
    value: "Bella",
    detail: "Consulta post-operatoria confirmada para el viernes." ,
  },
];

const receptionistDetails = [
  {
    title: "Propietarios recientes",
    items: [
      "Claudia Ríos - claudiarios@mail.com",
      "Andrés Castillo - andrescastillo@mail.com",
      "María López - maria.lopez@mail.com",
    ],
  },
  {
    title: "Mascotas recientes",
    items: [
      "Milo - Perro / Beagle",
      "Luna - Gato / Siamés",
      "Rocky - Perro / Golden Retriever",
    ],
  },
  {
    title: "Citas recientes",
    items: [
      "09:30 - Milo / Consulta general",
      "11:00 - Luna / Vacunación",
      "14:00 - Bella / Control posoperatorio",
    ],
  },
];

export default function AdminRecepcionistaPage() {
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
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Recepcionista</p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Información de recepción</h1>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
                    Aquí se muestra toda la información de recepcionista dentro del panel admin, sin redirigir a la vista externa.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {receptionistSummary.map((summary) => (
                  <article key={summary.title} className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{summary.title}</p>
                    <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{summary.value}</p>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{summary.description}</p>
                  </article>
                ))}
              </div>

              <div className="mt-10 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
                <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Aspectos destacados</h2>
                  <div className="mt-6 space-y-4">
                    {receptionistHighlights.map((highlight) => (
                      <div key={highlight.label} className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-950">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{highlight.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{highlight.value}</p>
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{highlight.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Detalles recientes</h2>
                  <div className="mt-6 space-y-5">
                    {receptionistDetails.map((section) => (
                      <div key={section.title} className="rounded-3xl border border-slate-200/70 bg-white p-5 dark:border-slate-700 dark:bg-slate-950">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{section.title}</h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                          {section.items.map((item) => (
                            <li key={item} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
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
