"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import NombreCliente from "./NombreCliente";
import { getCurrentUser } from "../../lib/auth";
import { fetchCitas } from "../../lib/api/citas";
import { fetchMascotas } from "../../lib/api/mascotas";
import { fetchPropietarioByUsuario } from "../../lib/api/propietarios";
import type { Appointment } from "../../lib/recepcionista/types";

const DAYS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

function getCitasSemana(citas: Appointment[]) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const counts = Array(7).fill(0);
  for (const cita of citas) {
    const d = new Date(cita.date);
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      if (d.toDateString() === day.toDateString()) {
        counts[i]++;
      }
    }
  }
  return DAYS.map((dia, i) => ({ dia, valor: counts[i] }));
}

function getStatusColor(status: string) {
  if (status === "Confirmada") return "bg-[#DDF5DE] text-[#2F9E44]";
  if (status === "Pendiente") return "bg-[#FBE9A9] text-[#9A6700]";
  if (status === "En atención") return "bg-[#DCE8FF] text-[#2F6BFF]";
  return "bg-[#F1F5F9] text-[#64748B]";
}

export default function ClientePage() {
  const [citas, setCitas] = useState<Appointment[]>([]);
  const [mascotasCount, setMascotasCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    const loadData = async () => {
      try {
        const userCitas = await fetchCitas();
        setCitas(userCitas);

        const propietario = await fetchPropietarioByUsuario(user.id);
        if (propietario) {
          const mascotas = await fetchMascotas(parseInt(propietario.id, 10));
          setMascotasCount(mascotas.length);
        } else {
          setMascotasCount(0);
        }
      } catch {
        setCitas([]);
        setMascotasCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const citasHoy = citas.filter((c) => c.date === today).length;
  const proximas = citas.filter((c) => c.date >= today).slice(0, 4);
  const citasSemana = getCitasSemana(citas);
  const maxValor = Math.max(...citasSemana.map((c) => c.valor), 1);

  const stats = [
    { title: "Citas Hoy", value: loading ? "—" : String(citasHoy), icon: <CalendarStatIcon /> },
    { title: "Mis Mascotas", value: loading ? "—" : String(mascotasCount ?? 0), icon: <PawStatIcon /> },
    { title: "Citas Totales", value: loading ? "—" : String(citas.length), icon: <BellStatIcon /> },
    { title: "Próximas Citas", value: loading ? "—" : String(proximas.length), icon: <VaccineStatIcon /> },
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-5 pb-6 pt-4 dark:bg-[#0F172A]">
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

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.98fr]">
        <section className="group h-[445px] overflow-hidden rounded-[10px] border border-[#CBD5E1] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF] dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.35)]">
          <h3 className="mb-5 text-[18px] font-semibold text-[#10213A] dark:text-white">
            Citas de la Semana
          </h3>
          <div className="relative h-[335px]">
            <div className="absolute left-0 top-0 flex h-[280px] flex-col justify-between text-[12px] text-[#64748B] dark:text-[#94A3B8]">
              <span>{maxValor}</span>
              <span>{Math.round(maxValor * 0.75)}</span>
              <span>{Math.round(maxValor * 0.5)}</span>
              <span>{Math.round(maxValor * 0.25)}</span>
              <span>0</span>
            </div>
            <div className="absolute left-10 right-2 top-0 h-[280px] border-b border-l border-[#94A3B8] dark:border-[#64748B]">
              <div className="absolute inset-0 grid grid-rows-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={`h-${i}`} className="border-b border-dashed border-[#E2E8F0] dark:border-[#334155]" />
                ))}
              </div>
              <div className="absolute inset-0 grid grid-cols-7">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={`v-${i}`} className="border-r border-dashed border-[#E2E8F0] dark:border-[#334155]" />
                ))}
              </div>
              <div className="absolute inset-x-3 bottom-0 top-0 flex items-end gap-3">
                {citasSemana.map((item) => (
                  <div key={item.dia} className="flex h-full flex-1 flex-col items-center justify-end">
                    <div
                      className="w-full max-w-[48px] origin-bottom rounded-t-[8px] bg-[#2F66E8] transition-all duration-300 ease-out group-hover:bg-[#2457D6] hover:scale-y-[1.04]"
                      style={{ height: `${(item.valor / maxValor) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute left-10 right-2 top-[292px] flex gap-3">
              {citasSemana.map((item) => (
                <div key={item.dia} className="flex flex-1 justify-center text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  {item.dia}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="group h-[445px] rounded-[10px] border border-[#CBD5E1] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF] dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.35)]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-[18px] font-semibold text-[#10213A] dark:text-white">
              Próximas Citas
            </h3>
            <ClockIcon />
          </div>

          {loading ? (
            <p className="text-sm text-[#64748B]">Cargando citas...</p>
          ) : proximas.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-12 text-center">
              <p className="text-sm font-semibold text-[#10213A] dark:text-white">Sin citas próximas</p>
              <p className="mt-2 text-xs text-[#64748B] dark:text-[#94A3B8]">Agenda una cita para comenzar.</p>
              <Link
                href="/cliente/agendar/nueva"
                className="mt-4 rounded-full bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
              >
                Agendar cita
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
              {proximas.map((cita) => (
                <article
                  key={cita.id}
                  className="-mx-3 flex items-start justify-between gap-4 rounded-lg px-3 py-4 transition-all duration-300 ease-out first:pt-2 last:pb-6 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                >
                  <div className="flex gap-6">
                    <div className="w-[60px] pt-0.5 text-[17px] font-semibold leading-none text-[#2F6BFF] transition-all duration-300 ease-out">
                      {cita.time}
                    </div>
                    <div>
                      <h4 className="text-[16px] font-semibold leading-none text-[#10213A] transition-colors duration-300 dark:text-white">
                        {cita.petName}
                      </h4>
                      <p className="mt-2.5 text-[13px] leading-none text-[#64748B] transition-colors duration-300 dark:text-[#94A3B8]">
                        {cita.ownerName || "—"}
                      </p>
                      <p className="mt-2.5 text-[13px] leading-none text-[#64748B] transition-colors duration-300 dark:text-[#94A3B8]">
                        {cita.service || "Sin servicio"}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-[5px] text-[11px] font-semibold leading-none transition-transform duration-300 ease-out hover:scale-105 ${getStatusColor(cita.status)}`}>
                    {cita.status}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* Icons */

function ClockIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" className="text-[#64748B] dark:text-[#94A3B8]" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748B] dark:text-[#94A3B8]" />
    </svg>
  );
}

function CalendarStatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M7 3.8v3.4M17 3.8v3.4M3.5 9.5h17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PawStatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <ellipse cx="8" cy="7.2" rx="2.2" ry="3" stroke="currentColor" strokeWidth="1.8" />
      <ellipse cx="14.7" cy="6.8" rx="2.2" ry="3" stroke="currentColor" strokeWidth="1.8" />
      <ellipse cx="17.8" cy="12.2" rx="2" ry="2.8" stroke="currentColor" strokeWidth="1.8" />
      <ellipse cx="6.2" cy="13.2" rx="2" ry="2.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 18.8c2 0 3.7-1.2 3.7-2.9 0-1.6-1.4-2.6-3-2.6-.8 0-1.5.2-2.1.6-.4.3-.9.4-1.5.4-1.5 0-2.7 1-2.7 2.4 0 1.3 1.1 2.1 2.6 2.1H12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function BellStatIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <path d="M15 18H6.5c.7-.8 1.5-2.2 1.5-4.8 0-3.2 1.8-5.2 4.5-5.2s4.5 2 4.5 5.2c0 2.6.8 4 1.5 4.8H15Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 19.2a2.2 2.2 0 0 0 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function VaccineStatIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <path d="m14 5 5 5M4 20l6.5-6.5M10 7l7 7M8 9l7 7M6.5 17.5 4 15l8-8 5 5-8 8-2.5-2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
