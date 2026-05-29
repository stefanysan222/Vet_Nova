"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Home,
  LogOut,
  PawPrint,
  Settings,
  ShieldCheck,
  Users2,
} from "lucide-react";
import { clearCurrentUser, getCurrentUser } from "../../lib/auth";

const menuItems = [
  { label: "Dashboard", href: "/recepcionista", icon: Home },
  { label: "Usuarios", href: "/recepcionista/usuarios", icon: Users2 },
  { label: "Mascotas", href: "/recepcionista/mascotas", icon: PawPrint },
  { label: "Citas", href: "/recepcionista/citas", icon: CalendarDays },
  { label: "Inventario", href: "/recepcionista/inventario", icon: CreditCard },
  { label: "Notificaciones", href: "/recepcionista/notificaciones", icon: Bell },
  { label: "Configuración", href: "/recepcionista/configuracion", icon: Settings },
];

export default function RecepcionistaLayoutShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Recepcionista");

  useEffect(() => {
    const user = getCurrentUser();
    setUserName(user?.name ?? "Recepcionista");
  }, []);

  const handleLogout = () => {
    clearCurrentUser();
    router.push("/login");
  };

  return (
    <main className="h-screen overflow-hidden bg-[#F5F7FB] text-[#10213A] dark:bg-[#0F172A] dark:text-white">
      <div className="flex h-screen overflow-hidden">
        <aside className="hidden lg:flex lg:h-screen lg:w-[300px] lg:flex-col lg:border-r lg:border-slate-200/70 lg:bg-white lg:px-6 lg:py-8 dark:lg:border-slate-800 dark:lg:bg-slate-950">
          <div className="flex flex-col gap-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-3 rounded-3xl bg-blue-600/10 px-4 py-3 text-blue-700 shadow-sm shadow-blue-500/10 ring-1 ring-blue-600/10 dark:text-blue-200">
                <div className="grid h-10 w-10 place-items-center rounded-3xl bg-blue-600 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">VetNova</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Recepción</p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200/70 bg-slate-50 p-5 shadow-sm shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Recepcionista</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{userName}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto space-y-4 rounded-[2rem] border border-slate-200/70 bg-slate-50 p-5 shadow-sm shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Soporte</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Disponible 24/7</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-blue-600" />
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <div className="inline-flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </div>
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                Panel de recepción
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                Control central
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 md:flex">
                <Bell className="mr-2 h-4 w-4 text-blue-600" />
                3 notificaciones nuevas
              </div>
              <div className="inline-flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-white">
                  <ChevronRight className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    Recepción activa
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">Buenos días</p>
                </div>
              </div>
            </div>
          </header>

          <div className="h-[calc(100vh-72px)] overflow-y-auto bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
