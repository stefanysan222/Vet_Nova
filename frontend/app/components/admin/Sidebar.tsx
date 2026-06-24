"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarDays,
  Home,
  LogOut,
  Settings,
  ShieldCheck,
  Users2,
  Box,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../../../lib/auth";
import { useAuth } from "@/lib/auth-context";
import { useIsDarkMode } from "@/lib/hooks/useDarkMode";

const menuItems = [
  { label: "Dashboard", icon: Home, href: "/admin" },
  { label: "Usuarios", icon: Users2, href: "/admin/usuarios" },
  { label: "Citas", icon: CalendarDays, href: "/admin/citas" },
  { label: "Mascotas", icon: Box, href: "/admin/mascotas" },
  { label: "Reportes", icon: BarChart3, href: "/admin/reportes" },
  { label: "Notificaciones", icon: Bell, href: "/admin/notificaciones" },
  { label: "Configuración", icon: Settings, href: "/admin/configuracion" },
];

function NavLinks({ onItemClick, pathname }: { onItemClick?: () => void; pathname: string }) {
  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onItemClick}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#A78BFA]/10 dark:text-[#A78BFA]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const darkMode = useIsDarkMode();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:h-dvh lg:w-[260px] lg:flex-col lg:border-r lg:border-slate-200/70 lg:bg-white lg:px-4 lg:py-6 dark:lg:border-slate-800 dark:lg:bg-slate-950">
        {/* Logo */}
        <div className="mb-6 flex items-center gap-3 px-1">
          <div className="relative h-11 w-11 shrink-0">
            <Image
              src={
                darkMode ? "/logos/vetnova-wordmark-dark.png" : "/logos/vetnova-wordmark-light.png"
              }
              alt="VetNova"
              fill
              sizes="44px"
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {user?.clinicaNombre ?? "Panel administrativo"}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">Administrador</p>
          </div>
        </div>

        {/* Navegación */}
        <div className="flex-1 overflow-y-auto">
          <NavLinks pathname={pathname} />
        </div>

        {/* Footer del sidebar */}
        <div className="mt-6 space-y-3 border-t border-slate-200/70 pt-4 dark:border-slate-800">
          <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Soporte 24/7</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Botón menú mobile */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="fixed left-4 top-[max(1rem,env(safe-area-inset-top))] z-50 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-card ring-1 ring-slate-200 dark:bg-slate-900 dark:text-white dark:ring-slate-700"
        >
          <BarChart3 className="h-4 w-4 text-brand-600" />
          Menú
        </button>
      </div>

      {/* Sidebar mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="absolute bottom-0 left-0 top-0 w-[260px] bg-white px-4 py-6 shadow-2xl dark:bg-slate-950"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cerrar mobile */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-9 w-9 shrink-0">
                    <Image
                      src={
                        darkMode
                          ? "/logos/vetnova-wordmark-dark.png"
                          : "/logos/vetnova-wordmark-light.png"
                      }
                      alt="VetNova"
                      fill
                      sizes="36px"
                      className="object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {user?.clinicaNombre ?? "Panel administrativo"}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      Administrador
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ×
                </button>
              </div>

              <NavLinks pathname={pathname} onItemClick={() => setMobileOpen(false)} />

              <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
