"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  CalendarDays,
  CreditCard,
  Home,
  LogOut,
  Settings,
  ShieldCheck,
  Smile,
  User,
  Users2,
  PawPrint,
  Box,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { label: "Dashboard", icon: Home, href: "/admin" },
  { label: "Usuarios", icon: Users2, href: "/admin/usuarios" },
  { label: "Veterinarios", icon: User, href: "/admin/veterinarios" },
  { label: "Mascotas", icon: PawPrint, href: "/admin/mascotas" },
  { label: "Citas", icon: CalendarDays, href: "/admin/citas" },
  { label: "Inventario", icon: Box, href: "/admin/inventario" },
  { label: "Facturación", icon: CreditCard, href: "/admin/facturacion" },
  { label: "Reportes", icon: BarChart3, href: "/admin/reportes" },
  { label: "Configuración", icon: Settings, href: "/admin/configuracion" },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden lg:flex lg:h-screen lg:w-[320px] lg:flex-col lg:border-r lg:border-slate-200/70 lg:bg-white lg:px-6 lg:py-8 lg:shadow-[0_30px_80px_rgba(15,23,42,0.08)] dark:lg:border-slate-800 dark:lg:bg-slate-950 dark:text-slate-100">
        <div className="flex flex-col gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3 rounded-3xl bg-blue-600/10 px-4 py-3 text-blue-700 shadow-sm shadow-blue-500/10 ring-1 ring-blue-600/10">
              <Briefcase className="h-5 w-5" />
              <span className="text-sm font-semibold">VetNova Admin</span>
            </div>
            <div className="rounded-[2rem] border border-slate-200/70 bg-slate-50 p-5 shadow-sm shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-md shadow-blue-500/10">
                  <Users2 className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Ana Pérez</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Administrador</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto space-y-4 rounded-[2rem] border border-slate-200/70 bg-slate-50 p-5 shadow-sm shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Soporte 24/7</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Monitoreo en vivo</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-blue-600" />
          </div>
          <button className="w-full rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="fixed left-4 top-4 z-40 inline-flex items-center gap-2 rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200"
        >
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Menu
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/50"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="absolute left-0 top-0 bottom-0 w-[280px] bg-white px-5 py-8 shadow-2xl dark:bg-slate-950"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-3 rounded-3xl bg-blue-600/10 px-4 py-3 text-blue-700 shadow-sm shadow-blue-500/10">
                  <Briefcase className="h-5 w-5" />
                  <span className="text-sm font-semibold">VetNova</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                >
                  ×
                </button>
              </div>

              <div className="mt-8 space-y-5">
                <div className="rounded-[2rem] border border-slate-200/70 bg-slate-50 p-4 shadow-sm shadow-slate-200/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-md shadow-blue-500/10">
                      <Users2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Ana Pérez</p>
                      <p className="text-sm text-slate-500">Administrador</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-semibold transition ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
                <button className="w-full rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-700">
                  Cerrar sesión
                </button>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
