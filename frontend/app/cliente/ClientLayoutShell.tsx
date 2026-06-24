"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  CalendarDays,
  PawPrint,
  Settings,
  LogOut,
  Bell,
  Check,
  User,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import AvatarCliente from "./AvatarCliente";
import BuscadorCliente from "./BuscadorCliente";
import { logout } from "../../lib/auth";
import { useAuth } from "@/lib/auth-context";
import { useClienteProfile } from "./ClienteProfileContext";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useClickOutside } from "@/lib/hooks/useClickOutside";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Ahora";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  return `Hace ${Math.floor(h / 24)}d`;
}

export default function ClientLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("vetnova-theme") === "dark";
  });
  const { perfil } = useClienteProfile();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const {
    count: notifCount,
    items: notifItems,
    loadItems: loadNotifItems,
    marcarLeida,
    marcarTodasLeidas,
  } = useNotifications({ enabled: !!user });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "Cliente") {
      const routes: Record<string, string> = {
        SuperAdministrador: "/super-admin",
        Administrador: "/admin",
        Veterinario: "/veterinario",
      };
      router.replace(routes[user.role] ?? "/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    // Close menus on route change — setState allowed here (no cascade risk, boolean flip)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowNotifications(false);
    setShowUserMenu(false);
  }, [pathname]);

  useClickOutside(notifRef, () => setShowNotifications(false));
  useClickOutside(userMenuRef, () => setShowUserMenu(false));

  // Cargar lista al abrir el dropdown
  useEffect(() => {
    if (!showNotifications) return;
    loadNotifItems();
  }, [showNotifications, loadNotifItems]);

  const handleMarcarLeida = (id: number) => {
    marcarLeida(id);
  };

  const handleMarcarTodas = () => {
    marcarTodasLeidas();
  };

  function toggleDarkMode() {
    const nextValue = !darkMode;

    setDarkMode(nextValue);
    document.documentElement.classList.toggle("dark", nextValue);
    localStorage.setItem("vetnova-theme", nextValue ? "dark" : "light");
  }

  const nombreCompleto = `${perfil.nombre} ${perfil.apellido}`;

  return (
    <main className="h-dvh overflow-hidden bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-white">
      <div className="flex h-dvh overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden h-dvh w-[260px] shrink-0 border-r border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900 lg:flex lg:flex-col">
          <div className="flex h-[78px] items-center gap-3 border-b border-surface-200 px-5 dark:border-surface-800">
            <div className="relative h-11 w-11 shrink-0">
              <Image
                src={
                  darkMode
                    ? "/logos/vetnova-wordmark-dark.png"
                    : "/logos/vetnova-wordmark-light.png"
                }
                alt="VetNova"
                fill
                sizes="44px"
                className="object-contain"
              />
            </div>

            <p className="text-caption">Sistema Veterinario</p>
          </div>

          <nav className="flex-1 px-4 py-4">
            <SidebarItem
              href="/cliente"
              active={pathname === "/cliente"}
              icon={<Home className="h-5 w-5" />}
            >
              Dashboard
            </SidebarItem>

            <SidebarItem
              href="/cliente/agendar"
              active={pathname.startsWith("/cliente/agendar")}
              icon={<CalendarDays className="h-5 w-5" />}
            >
              Citas
            </SidebarItem>

            <SidebarItem
              href="/cliente/mascotas"
              active={pathname.startsWith("/cliente/mascotas")}
              icon={<PawPrint className="h-5 w-5" />}
            >
              Mascotas
            </SidebarItem>

            <SidebarItem
              href="/cliente/configuracion"
              active={pathname.startsWith("/cliente/configuracion")}
              icon={<Settings className="h-5 w-5" />}
            >
              Configuración
            </SidebarItem>
          </nav>

          <div className="border-t border-surface-200 px-5 py-5 dark:border-surface-800">
            <button
              type="button"
              onClick={() => {
                logout().then(() => router.push("/login"));
              }}
              className="flex items-center gap-3 text-sm font-semibold text-surface-900 transition-colors hover:text-brand-600 dark:text-white dark:hover:text-brand-300"
            >
              <LogOut className="h-[19px] w-[19px]" />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Contenido principal */}
        <section className="min-w-0 flex-1">
          {/* Barra superior */}
          <header className="relative flex h-[64px] items-center justify-between border-b border-surface-200 bg-white px-5 dark:border-surface-800 dark:bg-surface-900">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900 lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <BuscadorCliente />

            <div className="ml-5 flex items-center gap-4">
              {/* Botón notificaciones */}
              <div ref={notifRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className="relative flex h-8 w-8 items-center justify-center rounded-lg text-surface-900 transition-colors hover:bg-surface-100 dark:text-white dark:hover:bg-surface-800"
                  aria-label="Abrir notificaciones"
                >
                  <Bell className="h-[19px] w-[19px]" />
                  {notifCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-surface-900">
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  )}
                </button>

                {/* Ventana de notificaciones */}
                {showNotifications && (
                  <div className="absolute right-0 top-[48px] z-50 w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900 sm:w-[380px]">
                    <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4 dark:border-surface-700">
                      <div>
                        <h3 className="text-base font-semibold text-surface-900 dark:text-white">
                          Notificaciones
                        </h3>
                        <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                          {notifItems && notifItems.length > 0
                            ? `${notifItems.length} sin leer`
                            : "No tienes notificaciones nuevas"}
                        </p>
                      </div>
                      {notifItems && notifItems.length > 0 && (
                        <button
                          onClick={handleMarcarTodas}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300"
                        >
                          Marcar todas leídas
                        </button>
                      )}
                    </div>

                    <div className="max-h-[290px] divide-y divide-surface-200 overflow-y-auto dark:divide-surface-700">
                      {notifItems === null ? (
                        <div className="space-y-2 p-3">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="h-12 animate-pulse rounded-xl bg-surface-100 dark:bg-surface-800"
                            />
                          ))}
                        </div>
                      ) : notifItems.length === 0 ? (
                        <p className="px-5 py-6 text-center text-sm text-surface-500 dark:text-surface-400">
                          No tienes notificaciones nuevas.
                        </p>
                      ) : (
                        notifItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-3 px-5 py-4 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800"
                          >
                            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                              <Bell className="h-[18px] w-[18px]" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-surface-900 dark:text-white">
                                  {item.titulo}
                                </h4>
                                <span className="h-2 w-2 rounded-full bg-danger-500" />
                              </div>

                              <p className="mt-1 text-xs leading-5 text-surface-500 dark:text-surface-400">
                                {item.mensaje}
                              </p>

                              <p className="text-caption mt-2">{timeAgo(item.creadaEn)}</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleMarcarLeida(item.id)}
                              className="mt-0.5 shrink-0 self-start rounded-lg p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-700"
                              title="Marcar como leída"
                              aria-label="Marcar como leída"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="border-t border-surface-200 p-4 dark:border-surface-700">
                      <Link
                        href="/cliente/notificaciones"
                        onClick={() => setShowNotifications(false)}
                        className="flex h-[40px] w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                      >
                        Ver más
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-surface-200 dark:bg-surface-700" />

              {/* Perfil del cliente */}
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800"
                  aria-label="Abrir menú de perfil"
                >
                  <div className="text-right">
                    <p className="text-sm font-semibold leading-none text-surface-900 dark:text-white">
                      {nombreCompleto}
                    </p>

                    <p className="text-caption mt-1.5">Cliente</p>
                  </div>

                  <AvatarCliente size="small" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-[48px] z-50 w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900 sm:w-[280px]">
                    <div className="flex items-center gap-3 border-b border-surface-200 px-5 py-4 dark:border-surface-700">
                      <AvatarCliente />

                      <div>
                        <p className="text-sm font-semibold text-surface-900 dark:text-white">
                          {nombreCompleto}
                        </p>

                        <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                          Cliente
                        </p>
                      </div>
                    </div>

                    <div className="py-2">
                      <UserMenuItem
                        href="/cliente/perfil"
                        onClick={() => setShowUserMenu(false)}
                        icon={<User className="h-[19px] w-[19px]" />}
                      >
                        Ver perfil
                      </UserMenuItem>

                      <UserMenuItem
                        href="/cliente/mascotas"
                        onClick={() => setShowUserMenu(false)}
                        icon={<PawPrint className="h-[19px] w-[19px]" />}
                      >
                        Mis mascotas
                      </UserMenuItem>

                      <UserMenuItem
                        href="/cliente/agendar"
                        onClick={() => setShowUserMenu(false)}
                        icon={<CalendarDays className="h-[19px] w-[19px]" />}
                      >
                        Mis citas
                      </UserMenuItem>

                      <UserMenuItem
                        href="/cliente/configuracion"
                        onClick={() => setShowUserMenu(false)}
                        icon={<Settings className="h-[19px] w-[19px]" />}
                      >
                        Configuración del perfil
                      </UserMenuItem>

                      <button
                        type="button"
                        onClick={toggleDarkMode}
                        className="flex w-full items-center justify-between px-5 py-3 text-sm font-semibold text-surface-900 transition-colors hover:bg-surface-50 dark:text-white dark:hover:bg-surface-800"
                      >
                        <span className="flex items-center gap-3">
                          {darkMode ? (
                            <Sun className="h-[19px] w-[19px]" />
                          ) : (
                            <Moon className="h-[19px] w-[19px]" />
                          )}
                          {darkMode ? "Modo claro" : "Modo oscuro"}
                        </span>

                        <span
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            darkMode ? "bg-brand-500" : "bg-surface-300 dark:bg-surface-600"
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                              darkMode ? "translate-x-[22px]" : "translate-x-[2px]"
                            }`}
                          />
                        </span>
                      </button>
                    </div>

                    <div className="border-t border-surface-200 py-2 dark:border-surface-700">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          logout().then(() => router.push("/login"));
                        }}
                        className="dark:hover:bg-danger-950/30 flex w-full items-center gap-3 px-5 py-3 text-sm font-semibold text-danger-500 transition-colors hover:bg-danger-50"
                      >
                        <LogOut className="h-[19px] w-[19px]" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Página activa */}
          <div className="h-[calc(100dvh-64px)] overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm" />
          <div
            className="absolute left-0 top-0 h-full w-[260px] bg-white dark:bg-surface-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-[64px] items-center justify-between border-b border-surface-200 px-5 dark:border-surface-800">
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
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4">
              <SidebarItem
                href="/cliente"
                active={pathname === "/cliente"}
                icon={<Home className="h-5 w-5" />}
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </SidebarItem>
              <SidebarItem
                href="/cliente/agendar"
                active={pathname.startsWith("/cliente/agendar")}
                icon={<CalendarDays className="h-5 w-5" />}
                onClick={() => setMobileOpen(false)}
              >
                Citas
              </SidebarItem>
              <SidebarItem
                href="/cliente/mascotas"
                active={pathname.startsWith("/cliente/mascotas")}
                icon={<PawPrint className="h-5 w-5" />}
                onClick={() => setMobileOpen(false)}
              >
                Mascotas
              </SidebarItem>
              <SidebarItem
                href="/cliente/configuracion"
                active={pathname.startsWith("/cliente/configuracion")}
                icon={<Settings className="h-5 w-5" />}
                onClick={() => setMobileOpen(false)}
              >
                Configuración
              </SidebarItem>
            </nav>
            <div className="border-t border-surface-200 px-5 py-5 dark:border-surface-800">
              <button
                type="button"
                onClick={() => {
                  logout().then(() => router.push("/login"));
                }}
                className="flex items-center gap-3 text-sm font-semibold text-surface-900 transition-colors hover:text-brand-600 dark:text-white"
              >
                <LogOut className="h-[19px] w-[19px]" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SidebarItem({
  href,
  active,
  icon,
  children,
  onClick,
}: {
  href: string;
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`mb-2 flex h-11 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-all ${
        active
          ? "bg-brand-600 text-white shadow-brand-sm"
          : "text-slate-700 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function UserMenuItem({
  href,
  icon,
  children,
  onClick,
  danger = false,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors ${
        danger
          ? "dark:hover:bg-danger-950/30 text-danger-500 hover:bg-danger-50"
          : "text-surface-900 hover:bg-surface-50 dark:text-white dark:hover:bg-surface-800"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
