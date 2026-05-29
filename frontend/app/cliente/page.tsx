import Link from "next/link";
import type { ReactNode } from "react";
import NombreCliente from "./NombreCliente";



type Stat = {
  title: string;
  value: string;
  icon: ReactNode;
};

const stats: Stat[] = [
  { title: "Citas Hoy", value: "12", icon: <CalendarStatIcon /> },
  { title: "Mascotas Activas", value: "248", icon: <PawStatIcon /> },
  { title: "Notificaciones", value: "3", icon: <BellStatIcon /> },
  { title: "Vacunas Pendientes", value: "2", icon: <VaccineStatIcon /> },
];

const citasSemana = [
  { dia: "Lun", valor: 12 },
  { dia: "Mar", valor: 19 },
  { dia: "Mie", valor: 15 },
  { dia: "Jue", valor: 22 },
  { dia: "Vie", valor: 18 },
  { dia: "Sab", valor: 8 },
  { dia: "Dom", valor: 5 },
];

const proximasCitas = [
  {
    hora: "09:00",
    mascota: "Max",
    dueño: "Juan Pérez",
    servicio: "Consulta General",
    estado: "Confirmada",
    color: "bg-[#DDF5DE] text-[#2F9E44]",
  },
  {
    hora: "10:30",
    mascota: "Luna",
    dueño: "María García",
    servicio: "Vacunación",
    estado: "Pendiente",
    color: "bg-[#FBE9A9] text-[#9A6700]",
  },
  {
    hora: "11:00",
    mascota: "Rocky",
    dueño: "Carlos López",
    servicio: "Cirugía Menor",
    estado: "Confirmada",
    color: "bg-[#DDF5DE] text-[#2F9E44]",
  },
  {
    hora: "14:00",
    mascota: "Bella",
    dueño: "Ana Martínez",
    servicio: "Control Post-Op",
    estado: "En Proceso",
    color: "bg-[#DCE8FF] text-[#2F6BFF]",
  },
];

export default function ClientePage() {
  return (
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-5 pb-6 pt-4 dark:bg-[#0F172A]">
      {/* Header */}
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-[#EAF1FF] px-4 py-1.5 text-[13px] font-semibold text-[#64748B] dark:bg-[#1E293B] dark:text-[#CBD5E1]">
            Dashboard
          </span>
          <span className="text-[14px] font-semibold text-[#94A3B8]">/</span>
          <span className="text-[14px] font-semibold text-[#10213A] dark:text-white">
            Cliente
          </span>
        </div>

        <p className="text-[16px] leading-7 text-[#64748B] dark:text-[#94A3B8]">
          Bienvenido a VetNova. Consulta tus mascotas, revisa tus próximas citas
          y mantente al día con tus recordatorios veterinarios.
        </p>
      </div>

      {/* Welcome banner */}
      <section className="group relative mb-5 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#2563EB] via-[#2385F3] to-[#06A7E9] px-10 py-8 shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(37,99,235,0.32)]">
        <div className="absolute left-0 top-0 h-full w-full opacity-20">
          <div className="absolute left-[18%] top-[-40px] h-[260px] w-[260px] rounded-full bg-white blur-3xl" />
          <div className="absolute right-[8%] top-[20px] h-[220px] w-[220px] rounded-full bg-cyan-200 blur-3xl" />
        </div>


        <div className="relative z-10 flex items-center justify-between gap-6">
          <div className="max-w-[760px]">
            <p className="mb-5 tracking-[0.35em] text-[15px] font-semibold uppercase text-white/70">
              Cliente
            </p>

            <h1 className="text-[42px] font-bold leading-tight text-white">
              Bienvenido, <NombreCliente />
            </h1>

            <p className="mt-5 max-w-[780px] text-[20px] leading-9 text-white/80">
              Gestiona tus mascotas, agenda nuevas citas y revisa tus
              recordatorios desde un solo lugar de forma rápida y sencilla.
            </p>
          </div>

          <Link
  href="/cliente/agendar/nueva"
  className="inline-flex h-[64px] items-center justify-center rounded-full bg-white px-10 text-[18px] font-semibold text-[#2F6BFF] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(15,23,42,0.15)] active:translate-y-0"
>
  Agendar nueva cita
</Link>
        </div>
      </section>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="group flex h-[80px] items-center justify-between rounded-[10px] border border-[#CBD5E1] bg-white px-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF] dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.35)]"
          >
            <div>
              <p className="text-[13px] leading-none text-[#64748B] transition-colors duration-300 dark:text-[#94A3B8]">
                {item.title}
              </p>
              <h3 className="mt-3 text-[20px] font-semibold leading-none text-[#10213A] transition-colors duration-300 dark:text-white">
                {item.value}
              </h3>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#2563EB] transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-[#2F6BFF] group-hover:text-white dark:bg-[#1E3A8A] dark:text-[#93C5FD] dark:group-hover:bg-[#2F6BFF] dark:group-hover:text-white">
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.98fr]">
        {/* Chart */}
        <section className="group h-[445px] overflow-hidden rounded-[10px] border border-[#CBD5E1] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF] dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.35)]">
          <h3 className="mb-5 text-[18px] font-semibold text-[#10213A] dark:text-white">
            Citas de la Semana
          </h3>

          <div className="relative h-[335px]">
            <div className="absolute left-0 top-0 flex h-[280px] flex-col justify-between text-[12px] text-[#64748B] dark:text-[#94A3B8]">
              <span>24</span>
              <span>18</span>
              <span>12</span>
              <span>6</span>
              <span>0</span>
            </div>

            <div className="absolute left-10 right-2 top-0 h-[280px] border-b border-l border-[#94A3B8] dark:border-[#64748B]">
              <div className="absolute inset-0 grid grid-rows-4">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={`h-${i}`}
                    className="border-b border-dashed border-[#E2E8F0] dark:border-[#334155]"
                  />
                ))}
              </div>

              <div className="absolute inset-0 grid grid-cols-7">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={`v-${i}`}
                    className="border-r border-dashed border-[#E2E8F0] dark:border-[#334155]"
                  />
                ))}
              </div>

              <div className="absolute inset-x-3 bottom-0 top-0 flex items-end gap-3">
                {citasSemana.map((item) => (
                  <div
                    key={item.dia}
                    className="flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <div
                      className="w-full max-w-[48px] origin-bottom rounded-t-[8px] bg-[#2F66E8] transition-all duration-300 ease-out group-hover:bg-[#2457D6] hover:scale-y-[1.04]"
                      style={{ height: `${(item.valor / 24) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute left-10 right-2 top-[292px] flex gap-3">
              {citasSemana.map((item) => (
                <div
                  key={item.dia}
                  className="flex flex-1 justify-center text-[12px] text-[#64748B] dark:text-[#94A3B8]"
                >
                  {item.dia}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming appointments */}
        <section className="group h-[445px] rounded-[10px] border border-[#CBD5E1] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF] dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.35)]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-[18px] font-semibold text-[#10213A] dark:text-white">
              Próximas Citas
            </h3>
            <ClockIcon />
          </div>

          <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
            {proximasCitas.map((cita) => (
              <article
                key={`${cita.hora}-${cita.mascota}`}
                className="-mx-3 flex items-start justify-between gap-4 rounded-lg px-3 py-4 transition-all duration-300 ease-out first:pt-2 last:pb-6 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
              >
                <div className="flex gap-6">
                  <div className="w-[60px] pt-0.5 text-[17px] font-semibold leading-none text-[#2F6BFF] transition-all duration-300 ease-out">
                    {cita.hora}
                  </div>

                  <div>
                    <h4 className="text-[16px] font-semibold leading-none text-[#10213A] transition-colors duration-300 dark:text-white">
                      {cita.mascota}
                    </h4>
                    <p className="mt-2.5 text-[13px] leading-none text-[#64748B] transition-colors duration-300 dark:text-[#94A3B8]">
                      {cita.dueño}
                    </p>
                    <p className="mt-2.5 text-[13px] leading-none text-[#64748B] transition-colors duration-300 dark:text-[#94A3B8]">
                      {cita.servicio}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-[5px] text-[11px] font-semibold leading-none transition-transform duration-300 ease-out hover:scale-105 ${cita.color}`}
                >
                  {cita.estado}
                </span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* Icons */

function ChevronLeftIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="m15 6-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        className="text-[#64748B] dark:text-[#94A3B8]"
      />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#64748B] dark:text-[#94A3B8]"
      />
    </svg>
  );
}

function CalendarStatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="15"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M7 3.8v3.4M17 3.8v3.4M3.5 9.5h17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PawStatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <ellipse
        cx="8"
        cy="7.2"
        rx="2.2"
        ry="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <ellipse
        cx="14.7"
        cy="6.8"
        rx="2.2"
        ry="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <ellipse
        cx="17.8"
        cy="12.2"
        rx="2"
        ry="2.8"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <ellipse
        cx="6.2"
        cy="13.2"
        rx="2"
        ry="2.8"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 18.8c2 0 3.7-1.2 3.7-2.9 0-1.6-1.4-2.6-3-2.6-.8 0-1.5.2-2.1.6-.4.3-.9.4-1.5.4-1.5 0-2.7 1-2.7 2.4 0 1.3 1.1 2.1 2.6 2.1H12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellStatIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 18H6.5c.7-.8 1.5-2.2 1.5-4.8 0-3.2 1.8-5.2 4.5-5.2s4.5 2 4.5 5.2c0 2.6.8 4 1.5 4.8H15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 19.2a2.2 2.2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VaccineStatIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <path
        d="m14 5 5 5M4 20l6.5-6.5M10 7l7 7M8 9l7 7M6.5 17.5 4 15l8-8 5 5-8 8-2.5-2.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}