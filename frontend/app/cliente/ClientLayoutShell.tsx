"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AvatarCliente from "./AvatarCliente";
import BuscadorCliente from "./BuscadorCliente";
import { getCurrentUser, clearCurrentUser } from "../../lib/auth";

const PROFILE_STORAGE_KEY = "vetnova_cliente_perfil";

type PerfilCliente = {
  nombre: string;
  apellido: string;
};

const notificationPreview: { title: string; description: string; time: string; unread: boolean }[] =
  [];

export default function ClientLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("vetnova-theme") === "dark";
  });
  const [perfil, setPerfil] = useState<PerfilCliente>(() => {
    const user = getCurrentUser();
    if (!user) return { nombre: "", apellido: "" };
    const partes = user.name.trim().split(" ");
    return { nombre: partes[0] ?? user.name, apellido: partes.slice(1).join(" ") || "" };
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "Cliente") {
      const routes: Record<string, string> = {
        Administrador: "/admin",
        Veterinario: "/veterinario",
      };
      router.replace(routes[user.role] ?? "/login");
    }
  }, [router]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const cargarPerfil = () => {
      const informacionGuardada = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!informacionGuardada) return;
      try {
        const datos = JSON.parse(informacionGuardada) as Partial<PerfilCliente>;
        setPerfil((prev) => ({
          nombre: datos.nombre || prev.nombre,
          apellido: datos.apellido ?? prev.apellido,
        }));
      } catch {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
      }
    };

    cargarPerfil();
    window.addEventListener("vetnova-profile-updated", cargarPerfil);
    window.addEventListener("storage", cargarPerfil);
    return () => {
      window.removeEventListener("vetnova-profile-updated", cargarPerfil);
      window.removeEventListener("storage", cargarPerfil);
    };
  }, []);

  useEffect(() => {
    // Close menus on route change — setState allowed here (no cascade risk, boolean flip)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowNotifications(false);
    setShowUserMenu(false);
  }, [pathname]);

  function toggleDarkMode() {
    const nextValue = !darkMode;

    setDarkMode(nextValue);
    document.documentElement.classList.toggle("dark", nextValue);
    localStorage.setItem("vetnova-theme", nextValue ? "dark" : "light");
  }

  const nombreCompleto = `${perfil.nombre} ${perfil.apellido}`;

  return (
    <main className="h-screen overflow-hidden bg-[#F5F7FB] text-[#10213A] dark:bg-[#0F172A] dark:text-white">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden h-screen w-[260px] shrink-0 border-r border-[#E5EAF2] bg-white dark:border-[#1E293B] dark:bg-[#111827] lg:flex lg:flex-col">
          <div className="flex h-[78px] items-center gap-3 border-b border-[#E5EAF2] px-5 dark:border-[#1E293B]">
            <Image
              src={darkMode ? "/logos/vetnova-logo-dark.png" : "/logos/vetnova-logo-light.png"}
              alt="VetNova Logo"
              width={40}
              height={40}
              className="rounded-xl object-contain"
            />

            <div>
              <h1 className="text-[22px] font-semibold leading-none text-[#10213A] dark:text-white">
                VetNova
              </h1>

              <p className="mt-1.5 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                Sistema Veterinario
              </p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4">
            <SidebarItem href="/cliente" active={pathname === "/cliente"} icon={<HomeIcon />}>
              Dashboard
            </SidebarItem>

            <SidebarItem
              href="/cliente/agendar"
              active={pathname.startsWith("/cliente/agendar")}
              icon={<CalendarMenuIcon />}
            >
              Citas
            </SidebarItem>

            <SidebarItem
              href="/cliente/mascotas"
              active={pathname.startsWith("/cliente/mascotas")}
              icon={<PawMenuIcon />}
            >
              Mascotas
            </SidebarItem>

            <SidebarItem
              href="/cliente/configuracion"
              active={pathname.startsWith("/cliente/configuracion")}
              icon={<SettingsIcon />}
            >
              Configuración
            </SidebarItem>
          </nav>

          <div className="border-t border-[#E5EAF2] px-5 py-5 dark:border-[#1E293B]">
            <button
              type="button"
              onClick={() => {
                clearCurrentUser();
                router.push("/login");
              }}
              className="flex items-center gap-3 text-[15px] font-semibold text-[#10213A] transition-colors hover:text-[#2F6BFF] dark:text-white dark:hover:text-[#60A5FA]"
            >
              <LogoutIcon />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Contenido principal */}
        <section className="min-w-0 flex-1">
          {/* Barra superior */}
          <header className="relative flex h-[64px] items-center justify-between border-b border-[#E5EAF2] bg-white px-5 dark:border-[#1E293B] dark:bg-[#111827]">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E5EAF2] bg-white dark:border-[#1E293B] dark:bg-[#111827] lg:hidden"
              aria-label="Abrir menú"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <BuscadorCliente />

            <div className="ml-5 flex items-center gap-4">
              {/* Botón notificaciones */}
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
                aria-label="Abrir notificaciones"
              >
                <BellIcon />
              </button>

              {/* Ventana de notificaciones */}
              {showNotifications && (
                <div className="absolute right-[112px] top-[58px] z-50 w-[380px] overflow-hidden rounded-xl border border-[#CBD5E1] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.16)] dark:border-[#334155] dark:bg-[#111827]">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4 dark:border-[#334155]">
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#10213A] dark:text-white">
                        Notificaciones
                      </h3>
                      <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                        No tienes notificaciones nuevas
                      </p>
                    </div>
                  </div>

                  <div className="max-h-[290px] divide-y divide-[#E2E8F0] overflow-y-auto dark:divide-[#334155]">
                    {notificationPreview.map((item) => (
                      <div
                        key={item.title}
                        className="flex gap-3 px-5 py-4 transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                      >
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
                          <BellSmallIcon />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-[14px] font-semibold text-[#10213A] dark:text-white">
                              {item.title}
                            </h4>

                            {item.unread && <span className="h-2 w-2 rounded-full bg-[#EF4444]" />}
                          </div>

                          <p className="mt-1 text-[13px] leading-5 text-[#64748B] dark:text-[#94A3B8]">
                            {item.description}
                          </p>

                          <p className="mt-2 text-[12px] text-[#94A3B8]">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#E2E8F0] p-4 dark:border-[#334155]">
                    <Link
                      href="/cliente/notificaciones"
                      onClick={() => setShowNotifications(false)}
                      className="flex h-[40px] w-full items-center justify-center rounded-xl bg-[#2F6BFF] text-[14px] font-semibold text-white transition-colors hover:bg-[#2457D6]"
                    >
                      Ver más
                    </Link>
                  </div>
                </div>
              )}

              <div className="h-8 w-px bg-[#E2E8F0] dark:bg-[#334155]" />

              {/* Perfil del cliente */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                  aria-label="Abrir menú de perfil"
                >
                  <div className="text-right">
                    <p className="text-[14px] font-semibold leading-none text-[#10213A] dark:text-white">
                      {nombreCompleto}
                    </p>

                    <p className="mt-1.5 text-[12px] text-[#64748B] dark:text-[#94A3B8]">Cliente</p>
                  </div>

                  <AvatarCliente size="small" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-[48px] z-50 w-[280px] overflow-hidden rounded-xl border border-[#CBD5E1] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.16)] dark:border-[#334155] dark:bg-[#111827]">
                    <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-5 py-4 dark:border-[#334155]">
                      <AvatarCliente />

                      <div>
                        <p className="text-[15px] font-semibold text-[#10213A] dark:text-white">
                          {nombreCompleto}
                        </p>

                        <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                          Cliente
                        </p>
                      </div>
                    </div>

                    <div className="py-2">
                      <UserMenuItem
                        href="/cliente/perfil"
                        onClick={() => setShowUserMenu(false)}
                        icon={<UserMenuIcon />}
                      >
                        Ver perfil
                      </UserMenuItem>

                      <UserMenuItem
                        href="/cliente/mascotas"
                        onClick={() => setShowUserMenu(false)}
                        icon={<PawMenuIcon />}
                      >
                        Mis mascotas
                      </UserMenuItem>

                      <UserMenuItem
                        href="/cliente/agendar"
                        onClick={() => setShowUserMenu(false)}
                        icon={<CalendarMenuIcon />}
                      >
                        Mis citas
                      </UserMenuItem>

                      <UserMenuItem
                        href="/cliente/configuracion"
                        onClick={() => setShowUserMenu(false)}
                        icon={<SettingsIcon />}
                      >
                        Configuración del perfil
                      </UserMenuItem>

                      <button
                        type="button"
                        onClick={toggleDarkMode}
                        className="flex w-full items-center justify-between px-5 py-3 text-[14px] font-semibold text-[#10213A] transition-colors hover:bg-[#F8FAFC] dark:text-white dark:hover:bg-[#1E293B]"
                      >
                        <span className="flex items-center gap-3">
                          {darkMode ? <SunIcon /> : <MoonIcon />}
                          {darkMode ? "Modo claro" : "Modo oscuro"}
                        </span>

                        <span
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            darkMode ? "bg-[#2F6BFF]" : "bg-[#94A3B8]"
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

                    <div className="border-t border-[#E2E8F0] py-2 dark:border-[#334155]">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          clearCurrentUser();
                          router.push("/login");
                        }}
                        className="flex w-full items-center gap-3 px-5 py-3 text-[14px] font-semibold text-[#EF4444] transition-colors hover:bg-[#FEF2F2] dark:hover:bg-[#28171B]"
                      >
                        <LogoutIcon />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Página activa */}
          <div className="h-[calc(100vh-64px)] overflow-hidden">
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
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute left-0 top-0 h-full w-[260px] bg-white dark:bg-[#111827]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-[64px] items-center justify-between border-b border-[#E5EAF2] px-5 dark:border-[#1E293B]">
              <div className="flex items-center gap-3">
                <Image
                  src={darkMode ? "/logos/vetnova-logo-dark.png" : "/logos/vetnova-logo-light.png"}
                  alt="VetNova"
                  width={32}
                  height={32}
                  className="rounded-xl object-contain"
                />
                <span className="text-[18px] font-semibold text-[#10213A] dark:text-white">
                  VetNova
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 px-4 py-4">
              <SidebarItem
                href="/cliente"
                active={pathname === "/cliente"}
                icon={<HomeIcon />}
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </SidebarItem>
              <SidebarItem
                href="/cliente/agendar"
                active={pathname.startsWith("/cliente/agendar")}
                icon={<CalendarMenuIcon />}
                onClick={() => setMobileOpen(false)}
              >
                Citas
              </SidebarItem>
              <SidebarItem
                href="/cliente/mascotas"
                active={pathname.startsWith("/cliente/mascotas")}
                icon={<PawMenuIcon />}
                onClick={() => setMobileOpen(false)}
              >
                Mascotas
              </SidebarItem>
              <SidebarItem
                href="/cliente/configuracion"
                active={pathname.startsWith("/cliente/configuracion")}
                icon={<SettingsIcon />}
                onClick={() => setMobileOpen(false)}
              >
                Configuración
              </SidebarItem>
            </nav>
            <div className="border-t border-[#E5EAF2] px-5 py-5 dark:border-[#1E293B]">
              <button
                type="button"
                onClick={() => {
                  clearCurrentUser();
                  router.push("/login");
                }}
                className="flex items-center gap-3 text-[15px] font-semibold text-[#10213A] transition-colors hover:text-[#2F6BFF] dark:text-white"
              >
                <LogoutIcon />
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
      className={`mb-2 flex h-[44px] items-center gap-3 rounded-xl px-4 text-[15px] font-semibold transition-all ${
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
      className={`flex items-center gap-3 px-5 py-3 text-[14px] font-semibold transition-colors ${
        danger
          ? "text-[#EF4444] hover:bg-[#FEF2F2] dark:hover:bg-[#28171B]"
          : "text-[#10213A] hover:bg-[#F8FAFC] dark:text-white dark:hover:bg-[#1E293B]"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function HomeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1v-8.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarMenuIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3v4M17 3v4M4.5 9.5h15M6.5 5h11a2 2 0 0 1 2 2v11.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PawMenuIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 12.5c-2 0-3.5 1.5-3.5 3.4 0 2.2 1.8 3.6 4 3.6h7c2.2 0 4-1.4 4-3.6 0-1.9-1.5-3.4-3.5-3.4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 8.5C9 10.4 8 12 6.7 12S4.5 10.4 4.5 8.5 5.5 5 6.7 5 9 6.6 9 8.5Zm10.5 0c0 1.9-1 3.5-2.2 3.5S15 10.4 15 8.5 16 5 17.3 5s2.2 1.6 2.2 3.5ZM14.5 8c0 2-1.1 3.6-2.5 3.6S9.5 10 9.5 8 10.6 4.4 12 4.4 14.5 6 14.5 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path
        d="M19 12c0-.5-.1-1-.2-1.5l2-1.5-2-3.4-2.4 1a7.3 7.3 0 0 0-2.5-1.5L13.5 2h-4l-.4 3.1a7.3 7.3 0 0 0-2.5 1.5l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 3l-2 1.5 2 3.4 2.4-1a7.3 7.3 0 0 0 2.5 1.5l.4 3.1h4l.4-3.1a7.3 7.3 0 0 0 2.5-1.5l2.4 1 2-3.4-2-1.5c.1-.5.2-1 .2-1.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      className="text-[#10213A] dark:text-white"
    >
      <path
        d="M18 9.5c0-3.3-2.4-5.5-6-5.5S6 6.2 6 9.5V14l-1.5 2h15L18 14V9.5ZM10 19h4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellSmallIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 9.5c0-3.3-2.4-5.5-6-5.5S6 6.2 6 9.5V14l-1.5 2h15L18 14V9.5ZM10 19h4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserMenuIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.9" />
      <path
        d="M5.5 20c.5-3.7 3-5.5 6.5-5.5s6 1.8 6.5 5.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.6 8.6 0 1 0 20 15.5Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.9" />
      <path
        d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}
