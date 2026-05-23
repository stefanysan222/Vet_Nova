const overview = [
  { title: "Consultas del Mes", value: "47" },
  { title: "Tratamientos Activos", value: "2" },
  { title: "Vacunas Pendientes", value: "3" },
];

const registros = [
  {
    mascota: "Rocky",
    dueño: "Carlos López",
    tipo: "Cirugía",
    detalle: "Remoción de tumor benigno",
    doctor: "Dr. Sánchez",
    fecha: "02 May 2026",
    estado: "Finalizado",
  },
  {
    mascota: "Charlie",
    dueño: "Luis Ramírez",
    tipo: "Consulta",
    detalle: "Infección de oído",
    doctor: "Dra. Fernández",
    fecha: "30 Abr 2026",
    estado: "En Tratamiento",
  },
  {
    mascota: "Bella",
    dueño: "Ana Martínez",
    tipo: "Control",
    detalle: "Post-operatorio",
    doctor: "Dr. Rodríguez",
    fecha: "28 Abr 2026",
    estado: "Finalizado",
  },
];

const vacunas = [
  { mascota: "Luna", vacuna: "Rabia", fecha: "15 May 2026" },
  { mascota: "Max", vacuna: "Parvovirus", fecha: "20 May 2026" },
  { mascota: "Mia", vacuna: "Triple Felina", fecha: "25 May 2026" },
];

const tratamientos = [
  { mascota: "Charlie", medicamento: "Antibiótico", dosis: "250mg cada 12h", duracion: "7 días" },
  { mascota: "Rocky", medicamento: "Analgésico", dosis: "100mg cada 8h", duracion: "5 días" },
];

export default function HistorialPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-[24px] border border-[#CBD5E1] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-[#334155] dark:bg-[#111827]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#64748B] dark:text-[#94A3B8]">
          Historial Clínico
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[#10213A] dark:text-white">
          Historial Clínico
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[#64748B] dark:text-[#94A3B8]">
          Registros médicos y tratamientos
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {overview.map((item) => (
          <article
            key={item.title}
            className="rounded-[18px] border border-[#CBD5E1] bg-white px-5 py-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] dark:border-[#334155] dark:bg-[#111827]"
          >
            <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
              {item.title}
            </p>
            <p className="mt-4 text-3xl font-semibold text-[#10213A] dark:text-white">
              {item.value}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr]">
        <section className="rounded-[20px] border border-[#CBD5E1] bg-white p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] dark:border-[#334155] dark:bg-[#111827]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[18px] font-semibold text-[#10213A] dark:text-white">
                Registros Recientes
              </h2>
              <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
                Últimos casos registrados en la clínica.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {registros.map((registro) => (
              <article
                key={`${registro.mascota}-${registro.fecha}`}
                className="rounded-[18px] border border-[#E5EAF2] bg-[#F8FAFC] p-5 dark:border-[#334155] dark:bg-[#111827]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[16px] font-semibold text-[#10213A] dark:text-white">
                      {registro.mascota} / {registro.dueño}
                    </p>
                    <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
                      {registro.tipo}: {registro.detalle}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#E0F2FE] px-3 py-1.5 text-sm font-semibold text-[#0C4A6E] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]">
                    {registro.estado}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#64748B] dark:text-[#94A3B8]">
                  <span>{registro.doctor}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#CBD5E1] dark:bg-[#475569]" />
                  <span>{registro.fecha}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-[20px] border border-[#CBD5E1] bg-white p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] dark:border-[#334155] dark:bg-[#111827]">
            <h3 className="mb-4 text-[17px] font-semibold text-[#10213A] dark:text-white">
              Vacunas Próximas
            </h3>
            <div className="space-y-3">
              {vacunas.map((item) => (
                <div
                  key={`${item.mascota}-${item.vacuna}`}
                  className="rounded-2xl border border-[#E5EAF2] bg-[#F8FAFC] px-4 py-4 dark:border-[#334155] dark:bg-[#111827]"
                >
                  <p className="font-semibold text-[#10213A] dark:text-white">
                    {item.mascota}
                  </p>
                  <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
                    {item.vacuna} • {item.fecha}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[20px] border border-[#CBD5E1] bg-white p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] dark:border-[#334155] dark:bg-[#111827]">
            <h3 className="mb-4 text-[17px] font-semibold text-[#10213A] dark:text-white">
              Tratamientos Activos
            </h3>
            <div className="space-y-3">
              {tratamientos.map((item) => (
                <div
                  key={`${item.mascota}-${item.medicamento}`}
                  className="rounded-2xl border border-[#E5EAF2] bg-[#F8FAFC] px-4 py-4 dark:border-[#334155] dark:bg-[#111827]"
                >
                  <p className="font-semibold text-[#10213A] dark:text-white">
                    {item.mascota}
                  </p>
                  <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
                    {item.medicamento} • {item.dosis}
                  </p>
                  <p className="mt-2 text-sm text-[#475569] dark:text-[#CBD5E1]">
                    {item.duracion}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
