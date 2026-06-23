"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, LogOut, Menu, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../../../lib/auth";
import { useAuth } from "@/lib/auth-context";
import { useIsDarkMode } from "@/lib/hooks/useDarkMode";

const menuItems = [{ label: "Veterinarias", icon: Building2, href: "/super-admin" }];

function NavLinks({ onItemClick, pathname }: { onItemClick?: () => void; pathname: string }) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto">
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
                ? "bg-brand-600/10 text-brand-600 dark:bg-brand-300/10 dark:text-brand-300"
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

export default function SuperAdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const darkMode = useIsDarkMode();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SA";

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:h-screen lg:w-[260px] lg:flex-col lg:border-r lg:border-slate-200/70 lg:bg-white lg:px-4 lg:py-6 dark:lg:border-slate-800 dark:lg:bg-slate-950">
        {/* Logo */}
        <div className="mb-6 flex items-center px-1">
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
        </div>

        {/* Perfil */}
        <div className="mb-6 flex items-center gap-3 border-b border-slate-200/70 px-1 pb-5 dark:border-slate-800">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-brand-600 bg-brand-600/10 text-xs font-bold text-brand-600 dark:border-brand-300 dark:bg-brand-300/10 dark:text-brand-300">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {user?.name ?? "Super Administrador"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Super Administrador</p>
          </div>
        </div>

        {/* Navegación */}
        <NavLinks pathname={pathname} />

        {/* Footer */}
        <div className="mt-6 space-y-3 border-t border-slate-200/70 pt-4 dark:border-slate-800">
          <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600 dark:text-brand-300" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Panel global VetNova
              </p>
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
          className="fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-card ring-1 ring-slate-200 dark:bg-slate-900 dark:text-white dark:ring-slate-700"
        >
          <Menu className="h-4 w-4 text-brand-600" />
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
              <div className="mb-2 flex items-center justify-between">
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
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ×
                </button>
              </div>

              <div className="mb-5 flex items-center gap-3 border-b border-slate-200 pb-5 dark:border-slate-800">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-brand-600 bg-brand-600/10 text-xs font-bold text-brand-600 dark:border-brand-300 dark:bg-brand-300/10 dark:text-brand-300">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {user?.name ?? "Super Administrador"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Super Administrador</p>
                </div>
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
