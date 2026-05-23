const notifications = [
  {
    title: "Cita confirmada",
    description: "La consulta de Max a las 09:00 AM ha sido confirmada.",
    time: "Hace 5 min",
  },
  {
    title: "Vacuna pendiente",
    description: "Luna necesita su refuerzo de rabia el 15 May 2026.",
    time: "Hace 30 min",
  },
  {
    title: "Historial actualizado",
    description: "El historial clínico de Rocky fue actualizado por el equipo.",
    time: "Ayer",
  },
];

export default function VeterinarioNotificacionesPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-[24px] border border-[#CBD5E1] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-[#334155] dark:bg-[#111827]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#64748B] dark:text-[#94A3B8]">
          Notificaciones
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[#10213A] dark:text-white">
          Centro de notificaciones
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[#64748B] dark:text-[#94A3B8]">
          Revisa los avisos recientes sobre citas, vacunas y actualizaciones de pacientes.
        </p>
      </header>

      <section className="rounded-[20px] border border-[#CBD5E1] bg-white p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)] dark:border-[#334155] dark:bg-[#111827]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-semibold text-[#10213A] dark:text-white">
              Notificaciones recientes
            </h2>
            <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
              Mantente al día con los cambios más importantes de tu clínica.
            </p>
          </div>
          <span className="rounded-2xl bg-[#EEF2FF] px-3 py-2 text-sm font-semibold text-[#2F6BFF] dark:bg-[#1E293B] dark:text-[#93C5FD]">
            {notifications.length} elementos
          </span>
        </div>

        <div className="space-y-4">
          {notifications.map((item) => (
            <article
              key={item.title}
              className="rounded-[18px] border border-[#E5EAF2] bg-[#F8FAFC] p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:border-[#334155] dark:bg-[#111827]"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#10213A] dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#64748B] dark:text-[#94A3B8]">
                    {item.description}
                  </p>
                </div>
                <span className="rounded-full bg-[#DDEBF7] px-3 py-1.5 text-sm font-semibold text-[#1659A9] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]">
                  {item.time}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
