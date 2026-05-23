const stats = [
  { title: "Citas Hoy", value: "12" },
  { title: "Mascotas Activas", value: "248" },
  { title: "Ingresos del Mes", value: "$15,234" },
];

const citasSemana = [
  { dia: "Lun", valor: 18 },
  { dia: "Mar", valor: 24 },
  { dia: "Mie", valor: 20 },
  { dia: "Jue", valor: 26 },
  { dia: "Vie", valor: 22 },
  { dia: "Sab", valor: 14 },
  { dia: "Dom", valor: 10 },
];

const proximasCitas = [
  {
    hora: "09:00",
    mascota: "Max",
    dueño: "Juan Pérez",
    servicio: "Consulta General",
    estado: "Confirmada",
    badge: "bg-[#DDF5DE] text-[#2F9E44]",
  },
  {
    hora: "10:30",
    mascota: "Luna",
    dueño: "María García",
    servicio: "Vacunación",
    estado: "Pendiente",
    badge: "bg-[#FBE9A9] text-[#9A6700]",
  },
  {
    hora: "11:00",
    mascota: "Rocky",
    dueño: "Carlos López",
    servicio: "Cirugía Menor",
    estado: "Confirmada",
    badge: "bg-[#DDF5DE] text-[#2F9E44]",
  },
  {
    hora: "14:00",
    mascota: "Bella",
    dueño: "Ana Martínez",
    servicio: "Control Post-Op",
    estado: "En Proceso",
    badge: "bg-[#DCE8FF] text-[#2F6BFF]",
  },
];

export default function VeterinarioPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-r from-[#2563EB] via-[#2385F3] to-[#06A7E9] p-8 text-white shadow-[0_22px_50px_rgba(37,99,235,0.22)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(37,99,235,0.28)]">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-white/80">
          Veterinario
        </p>
        <h1 className="text-[38px] font-bold leading-tight">
          Bienvenido, Dr. Rodríguez
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-white/85">
          Administra las citas del día, revisa el historial clínico y mantén el control completo de tus pacientes veterinarios.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <article
            key={item.title}
            className="group rounded-[16px] border border-[#CBD5E1] bg-white px-5 py-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(15,23,42,0.12)] dark:border-[#334155] dark:bg-[#111827]"
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

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.95fr]">
        <section className="group rounded-[16px] border border-[#CBD5E1] bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(15,23,42,0.12)] dark:border-[#334155] dark:bg-[#111827]">
          <h2 className="mb-5 text-[18px] font-semibold text-[#10213A] dark:text-white">
            Citas de la Semana
          </h2>
          <div className="relative h-[340px]">
            <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-sm text-[#64748B] dark:text-[#94A3B8]">
              <span>28</span>
              <span>21</span>
              <span>14</span>
              <span>7</span>
              <span>0</span>
            </div>
            <div className="absolute left-16 right-0 top-0 h-full border-l border-b border-[#CBD5E1] dark:border-[#334155]">
              <div className="absolute inset-0 grid grid-rows-5">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="border-b border-dashed border-[#E2E8F0] dark:border-[#334155]"
                  />
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-0 top-0 flex items-end gap-4 px-3">
                {citasSemana.map((item) => (
                  <div key={item.dia} className="flex flex-1 flex-col items-center justify-end gap-3">
                    <div
                      className="w-full max-w-[48px] rounded-t-[12px] bg-[#2F6BFF] transition-all duration-300 ease-out"
                      style={{ height: `${(item.valor / 28) * 100}%` }}
                    />
                    <span className="text-sm text-[#475569] dark:text-[#94A3B8]">
                      {item.dia}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="group rounded-[16px] border border-[#CBD5E1] bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(15,23,42,0.12)] dark:border-[#334155] dark:bg-[#111827]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-semibold text-[#10213A] dark:text-white">
                Próximas Citas
              </h2>
              <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
                Agenda veterinaria para el resto del día.
              </p>
            </div>
            <div className="rounded-2xl bg-[#EEF2FF] px-3 py-2 text-sm font-semibold text-[#2F6BFF] dark:bg-[#1E293B] dark:text-[#93C5FD]">
              4 registros
            </div>
          </div>

          <div className="space-y-4">
            {proximasCitas.map((item) => (
              <article
                key={`${item.hora}-${item.mascota}`}
                className="rounded-[18px] border border-[#E5EAF2] bg-[#F8FAFC] p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:border-[#334155] dark:bg-[#111827]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[15px] font-semibold text-[#10213A] dark:text-white">
                      {item.hora} - {item.mascota}
                    </p>
                    <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
                      {item.dueño} • {item.servicio}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${item.badge}`}>
                    {item.estado}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
