import Link from "next/link";

const stats = [
  {
    title: "Citas de hoy",
    value: "12",
    description: "Agenda programada",
  },
  {
    title: "Pacientes atendidos",
    value: "5",
    description: "Consultas completadas hoy",
  },
  {
    title: "Consultas pendientes",
    value: "7",
    description: "Pacientes por valorar",
  },
  {
    title: "Tratamientos registrados",
    value: "4",
    description: "Actualizados hoy",
  },
];

const agendaDiaria = [
  {
    hora: "08:00",
    mascota: "Toby",
    especie: "Canino",
    propietario: "Laura Gómez",
    motivo: "Control general",
    estado: "Atendida",
    badge: "bg-[#DCFCE7] text-[#15803D]",
  },
  {
    hora: "09:00",
    mascota: "Max",
    especie: "Canino",
    propietario: "Juan Pérez",
    motivo: "Consulta general",
    estado: "En consulta",
    badge: "bg-[#DBEAFE] text-[#2563EB]",
  },
  {
    hora: "10:30",
    mascota: "Luna",
    especie: "Felino",
    propietario: "María García",
    motivo: "Vacunación",
    estado: "Pendiente",
    badge: "bg-[#FEF3C7] text-[#B45309]",
  },
  {
    hora: "14:00",
    mascota: "Bella",
    especie: "Canino",
    propietario: "Ana Martínez",
    motivo: "Control postoperatorio",
    estado: "Pendiente",
    badge: "bg-[#FEF3C7] text-[#B45309]",
  },
];

const pacientesAtendidos = [
  {
    nombre: "Toby",
    propietario: "Laura Gómez",
    diagnostico: "Dermatitis leve",
    tratamiento: "Medicamento tópico",
    hora: "08:45",
  },
  {
    nombre: "Rocky",
    propietario: "Carlos López",
    diagnostico: "Control postoperatorio",
    tratamiento: "Curación y antibiótico",
    hora: "Ayer",
  },
  {
    nombre: "Mía",
    propietario: "Sofía Torres",
    diagnostico: "Gastroenteritis",
    tratamiento: "Dieta blanda y control",
    hora: "Ayer",
  },
];

export default function VeterinarioPage() {
  return (
    <div className="space-y-6">
      {/* BANNER PRINCIPAL */}
      <section className="rounded-[28px] bg-gradient-to-r from-[#2563EB] via-[#2385F3] to-[#06A7E9] px-8 py-8 text-white shadow-[0_22px_50px_rgba(37,99,235,0.20)]">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-white/80">
              Veterinario
            </p>

            <h1 className="text-[36px] font-bold leading-tight">
              Bienvenido, Dr. Rodríguez
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/90">
              Consulta tu agenda diaria, registra valoraciones y tratamientos,
              y revisa la historia clínica de tus pacientes.
            </p>
          </div>

          <Link
            href="/veterinario/consulta"
            className="flex h-[50px] shrink-0 items-center justify-center rounded-xl bg-white px-6 text-[15px] font-semibold text-[#2563EB] shadow-sm transition hover:bg-[#EFF6FF]"
          >
            + Registrar nueva consulta
          </Link>
        </div>
      </section>

      {/* ESTADÍSTICAS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.title}
            className="rounded-[18px] border border-[#E2E8F0] bg-white px-5 py-5 shadow-[0_4px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.09)] dark:border-[#334155] dark:bg-[#111827]"
          >
            <p className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              {stat.title}
            </p>

            <p className="mt-3 text-[30px] font-bold text-[#10213A] dark:text-white">
              {stat.value}
            </p>

            <p className="mt-2 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
              {stat.description}
            </p>
          </article>
        ))}
      </section>

      {/* CONTENIDO */}
      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.95fr]">
        {/* AGENDA DIARIA */}
        <article className="rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-[0_4px_18px_rgba(15,23,42,0.05)] dark:border-[#334155] dark:bg-[#111827]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-[19px] font-semibold text-[#10213A] dark:text-white">
                Agenda diaria
              </h2>

              <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                Consultas programadas para hoy.
              </p>
            </div>

            <Link
              href="/veterinario/citas"
              className="text-[14px] font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]"
            >
              Ver agenda completa
            </Link>
          </div>

          <div className="space-y-3">
            {agendaDiaria.map((cita) => (
              <div
                key={`${cita.hora}-${cita.mascota}`}
                className="flex flex-col justify-between gap-4 rounded-[16px] border border-[#E5EAF2] bg-[#F8FAFC] px-4 py-4 dark:border-[#334155] dark:bg-[#0F172A] sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-[48px] w-[60px] shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[14px] font-bold text-[#2563EB] dark:bg-[#1E293B] dark:text-[#93C5FD]">
                    {cita.hora}
                  </div>

                  <div>
                    <p className="text-[15px] font-semibold text-[#10213A] dark:text-white">
                      {cita.mascota}{" "}
                      <span className="font-normal text-[#64748B] dark:text-[#94A3B8]">
                        · {cita.especie}
                      </span>
                    </p>

                    <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                      {cita.propietario} · {cita.motivo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${cita.badge}`}
                  >
                    {cita.estado}
                  </span>

                  {cita.estado !== "Atendida" && (
                    <Link
                      href="/veterinario/consulta"
                      className="rounded-lg border border-[#D6E3FF] bg-white px-3 py-2 text-[12px] font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF] dark:border-[#334155] dark:bg-[#111827]"
                    >
                      Atender
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* PACIENTES ATENDIDOS */}
        <article className="rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-[0_4px_18px_rgba(15,23,42,0.05)] dark:border-[#334155] dark:bg-[#111827]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-[19px] font-semibold text-[#10213A] dark:text-white">
                Pacientes atendidos
              </h2>

              <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                Últimas valoraciones registradas.
              </p>
            </div>

            <Link
              href="/veterinario/mascotas"
              className="text-[14px] font-semibold text-[#2563EB]"
            >
              Ver todos
            </Link>
          </div>

          <div className="space-y-3">
            {pacientesAtendidos.map((paciente) => (
              <div
                key={paciente.nombre}
                className="rounded-[16px] border border-[#E5EAF2] px-4 py-4 dark:border-[#334155]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold text-[#10213A] dark:text-white">
                      {paciente.nombre}
                    </p>

                    <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                      Propietario: {paciente.propietario}
                    </p>
                  </div>

                  <span className="text-[12px] text-[#94A3B8]">
                    {paciente.hora}
                  </span>
                </div>

                <div className="mt-3 rounded-xl bg-[#F8FAFC] px-3 py-3 text-[13px] dark:bg-[#0F172A]">
                  <p className="text-[#475569] dark:text-[#CBD5E1]">
                    <span className="font-semibold">Diagnóstico:</span>{" "}
                    {paciente.diagnostico}
                  </p>

                  <p className="mt-1 text-[#475569] dark:text-[#CBD5E1]">
                    <span className="font-semibold">Tratamiento:</span>{" "}
                    {paciente.tratamiento}
                  </p>
                </div>

                <Link
                  href="/veterinario/historial"
                  className="mt-3 inline-flex text-[13px] font-semibold text-[#2563EB]"
                >
                  Consultar historial clínico
                </Link>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}