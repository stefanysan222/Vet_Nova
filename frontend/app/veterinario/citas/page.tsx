const citas = [
  {
    hora: "09:00",
    mascota: "Max",
    cliente: "Juan Pérez",
    servicio: "Consulta General",
    estado: "Confirmada",
  },
  {
    hora: "10:30",
    mascota: "Luna",
    cliente: "María García",
    servicio: "Vacunación",
    estado: "Pendiente",
  },
  {
    hora: "11:00",
    mascota: "Rocky",
    cliente: "Carlos López",
    servicio: "Cirugía Menor",
    estado: "Confirmada",
  },
  {
    hora: "14:00",
    mascota: "Bella",
    cliente: "Ana Martínez",
    servicio: "Control Post-Op",
    estado: "En Proceso",
  },
];

export default function VeterinarioCitasPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-[24px] border border-[#CBD5E1] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-[#334155] dark:bg-[#111827]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#64748B] dark:text-[#94A3B8]">
          Citas
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[#10213A] dark:text-white">
          Agenda Veterinaria
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[#64748B] dark:text-[#94A3B8]">
          Revisa las consultas programadas, confirma horarios y gestiona la atención de tus pacientes.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[18px] border border-[#CBD5E1] bg-white p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] dark:border-[#334155] dark:bg-[#111827]">
          <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">Citas pendientes</p>
          <p className="mt-4 text-4xl font-semibold text-[#10213A] dark:text-white">2</p>
          <p className="mt-3 text-sm text-[#64748B] dark:text-[#94A3B8]">Atiende las próximas consultas y actualiza estados rápido.</p>
        </article>

        <article className="rounded-[18px] border border-[#CBD5E1] bg-white p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] dark:border-[#334155] dark:bg-[#111827]">
          <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">Citas confirmadas</p>
          <p className="mt-4 text-4xl font-semibold text-[#10213A] dark:text-white">8</p>
          <p className="mt-3 text-sm text-[#64748B] dark:text-[#94A3B8]">Todo listo para el día, con pacientes esperando atención.</p>
        </article>
      </div>

      <section className="rounded-[20px] border border-[#CBD5E1] bg-white p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] dark:border-[#334155] dark:bg-[#111827]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-[#10213A] dark:text-white">Citas del día</h2>
            <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">Lista de pacientes agendados actualmente.</p>
          </div>
          <span className="rounded-2xl bg-[#EEF2FF] px-3 py-2 text-sm font-semibold text-[#2F6BFF] dark:bg-[#1E293B] dark:text-[#93C5FD]">
            4 citas
          </span>
        </div>

        <div className="space-y-3">
          {citas.map((cita) => (
            <article key={`${cita.hora}-${cita.mascota}`} className="rounded-[18px] border border-[#E5EAF2] bg-[#F8FAFC] p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:border-[#334155] dark:bg-[#111827]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[15px] font-semibold text-[#10213A] dark:text-white">{cita.hora} • {cita.mascota}</p>
                  <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">{cita.cliente} · {cita.servicio}</p>
                </div>
                <span className="rounded-full bg-[#DDEBF7] px-3 py-1.5 text-sm font-semibold text-[#1659A9] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]">
                  {cita.estado}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
