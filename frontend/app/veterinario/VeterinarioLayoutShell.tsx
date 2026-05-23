"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const navigation = [
  { label: "Dashboard", href: "/veterinario", icon: <DashboardIcon /> },
  { label: "Citas", href: "/veterinario/citas", icon: <CalendarIcon /> },
  { label: "Mascotas", href: "/veterinario/mascotas", icon: <PawIcon /> },
  {
    label: "Historial Clínico",
    href: "/veterinario/historial",
    icon: <HistoryIcon />,
  },
  {
    label: "Configuración",
    href: "/veterinario/configuracion",
    icon: <SettingsIcon />,
  },
];

const notificationPreview = [
  {
    title: "Cita próxima",
    description: "Max tiene consulta general a las 09:00 AM.",
    time: "Hace 10 min",
    unread: true,
  },
  {
    title: "Vacuna pendiente",
    description: "Luna tiene vacuna de rabia pendiente esta semana.",
    time: "Hace 1 hora",
    unread: true,
  },
  {
    title: "Historial actualizado",
    description: "Se actualizó el historial clínico de Rocky.",
    time: "Ayer",
    unread: false,
  },
];

export default function VeterinarioLayoutShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("vetnova-theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  function toggleDarkMode() {
    const nextValue = !darkMode;

    setDarkMode(nextValue);
    document.documentElement.classList.toggle("dark", nextValue);
    localStorage.setItem("vetnova-theme", nextValue ? "dark" : "light");
  }

  return (
    <main className="h-screen overflow-hidden bg-[#F5F7FB] text-[#10213A] dark:bg-[#0F172A] dark:text-white">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden h-screen w-[260px] shrink-0 border-r border-[#E5EAF2] bg-white dark:border-[#1E293B] dark:bg-[#111827] lg:flex lg:flex-col">
          <div className="flex h-[78px] items-center gap-3 border-b border-[#E5EAF2] px-5 dark:border-[#1E293B]">
            <img
              src={darkMode ? "/logos/vetnova-logo-dark.png" : "/logos/vetnova-logo-light.png"}
              alt="VetNova Logo"
              className="h-10 w-10 rounded-xl object-contain"
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
            {navigation.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                active={
                  pathname === item.href ||
                  (item.href !== "/veterinario" &&
                    pathname.startsWith(item.href))
                }
              >
                {item.label}
              </SidebarItem>
            ))}
          </nav>

          <div className="border-t border-[#E5EAF2] px-5 py-5 dark:border-[#1E293B]">
            <Link
              href="/"
              className="flex items-center gap-3 text-[15px] font-semibold text-[#10213A] hover:text-[#2F6BFF] dark:text-white"
            >
              <LogoutIcon />
              Cerrar Sesión
            </Link>
          </div>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1">
          {/* Topbar */}
          <header className="relative flex h-[64px] items-center justify-between border-b border-[#E5EAF2] bg-white px-5 dark:border-[#1E293B] dark:bg-[#111827]">
            <div className="w-full max-w-[505px]">
              <div className="flex h-[38px] items-center gap-3 rounded-lg border border-[#CBD5E1] bg-white px-3 dark:border-[#334155] dark:bg-[#0F172A]">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Buscar mascotas, citas..."
                  className="w-full bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-[#94A3B8] dark:text-white"
                />
              </div>
            </div>

            <div className="ml-5 flex items-center gap-4">
              {/* Notifications */}
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
              >
                <BellIcon />
                <span className="absolute right-[4px] top-[3px] h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
              </button>

              {showNotifications && (
                <div className="absolute right-[112px] top-[58px] z-50 w-[380px] overflow-hidden rounded-xl border border-[#CBD5E1] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.16)] dark:border-[#334155] dark:bg-[#111827]">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4 dark:border-[#334155]">
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#10213A] dark:text-white">
                        Notificaciones
                      </h3>
                      <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                        Tienes 2 notificaciones nuevas
                      </p>
                    </div>

                    <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-[12px] font-semibold text-[#2563EB]">
                      2 nuevas
                    </span>
                  </div>

                  <div className="max-h-[290px] divide-y divide-[#E2E8F0] overflow-y-auto dark:divide-[#334155]">
                    {notificationPreview.map((item) => (
                      <div
                        key={item.title}
                        className="flex gap-3 px-5 py-4 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                      >
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#2563EB]">
                          <BellSmallIcon />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-[14px] font-semibold text-[#10213A] dark:text-white">
                              {item.title}
                            </h4>

                            {item.unread && (
                              <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
                            )}
                          </div>

                          <p className="mt-1 text-[13px] leading-5 text-[#64748B] dark:text-[#94A3B8]">
                            {item.description}
                          </p>

                          <p className="mt-2 text-[12px] text-[#94A3B8]">
                            {item.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#E2E8F0] p-4 dark:border-[#334155]">
                    <Link
                      href="/veterinario/notificaciones"
                      onClick={() => setShowNotifications(false)}
                      className="flex h-[40px] w-full items-center justify-center rounded-xl bg-[#2F6BFF] text-[14px] font-semibold text-white"
                    >
                      Ver más
                    </Link>
                  </div>
                </div>
              )}

              <div className="h-8 w-px bg-[#E2E8F0] dark:bg-[#334155]" />

              {/* User menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                >
                  <div className="text-right">
                    <p className="text-[14px] font-semibold leading-none text-[#10213A] dark:text-white">
                      Dr. Rodríguez
                    </p>
                    <p className="mt-1.5 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                      Veterinarian
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F6BFF] text-[15px] font-semibold text-white">
                    D
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-[48px] z-50 w-[280px] overflow-hidden rounded-xl border border-[#CBD5E1] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.16)] dark:border-[#334155] dark:bg-[#111827]">
                    <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-5 py-4 dark:border-[#334155]">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2F6BFF] text-[16px] font-semibold text-white">
                        D
                      </div>

                      <div>
                        <p className="text-[15px] font-semibold text-[#10213A] dark:text-white">
                          Dr. Rodríguez
                        </p>
                        <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                          Veterinarian
                        </p>
                      </div>
                    </div>

                    <div className="py-2">
                      <UserMenuItem
                        href="/veterinario/perfil"
                        onClick={() => setShowUserMenu(false)}
                        icon={<UserMenuIcon />}
                      >
                        Ver perfil
                      </UserMenuItem>

                      <UserMenuItem
                        href="/veterinario/mascotas"
                        onClick={() => setShowUserMenu(false)}
                        icon={<PawIcon />}
                      >
                        Mis pacientes
                      </UserMenuItem>

                      <UserMenuItem
                        href="/veterinario/citas"
                        onClick={() => setShowUserMenu(false)}
                        icon={<CalendarIcon />}
                      >
                        Agenda del día
                      </UserMenuItem>

                      <UserMenuItem
                        href="/veterinario/configuracion"
                        onClick={() => setShowUserMenu(false)}
                        icon={<SettingsIcon />}
                      >
                        Configuración del perfil
                      </UserMenuItem>

                      <button
                        type="button"
                        onClick={toggleDarkMode}
                        className="flex w-full items-center justify-between px-5 py-3 text-[14px] font-semibold text-[#10213A] hover:bg-[#F8FAFC] dark:text-white dark:hover:bg-[#1E293B]"
                      >
                        <span className="flex items-center gap-3">
                          {darkMode ? <SunIcon /> : <MoonIcon />}
                          {darkMode ? "Modo claro" : "Modo oscuro"}
                        </span>

                        <span
                          className={`relative h-[22px] w-[40px] rounded-full transition ${
                            darkMode ? "bg-[#2F6BFF]" : "bg-[#94A3B8]"
                          }`}
                        >
                          <span
                            className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition ${
                              darkMode ? "left-[20px]" : "left-[2px]"
                            }`}
                          />
                        </span>
                      </button>
                    </div>

                    <div className="border-t border-[#E2E8F0] py-2 dark:border-[#334155]">
                      <Link
                        href="/"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-5 py-3 text-[14px] font-semibold text-[#EF4444] hover:bg-[#FEF2F2] dark:hover:bg-[#3F1D1D]"
                      >
                        <LogoutIcon />
                        Cerrar sesión
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="h-[calc(100vh-64px)] overflow-y-auto bg-[#F5F7FB] px-6 py-6 dark:bg-[#0B1120]">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

function SidebarItem({
  children,
  href,
  icon,
  active,
}: {
  children: ReactNode;
  href: string;
  icon: ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`mb-2.5 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[15px] font-semibold transition ${
        active
          ? "bg-[#2F6BFF] text-white shadow-sm"
          : "text-[#10213A] hover:bg-[#F8FAFC] dark:text-white dark:hover:bg-[#1E293B]"
      }`}
    >
      <span className={active ? "text-white" : "text-[#334155] dark:text-white"}>
        {icon}
      </span>
      {children}
    </Link>
  );
}

function UserMenuItem({
  children,
  href,
  icon,
  onClick,
}: {
  children: ReactNode;
  href: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-5 py-3 text-[14px] font-semibold text-[#10213A] hover:bg-[#F8FAFC] dark:text-white dark:hover:bg-[#1E293B]"
    >
      <span className="text-[#334155] dark:text-white">{icon}</span>
      {children}
    </Link>
  );
}

/* Icons */

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="4"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="13"
        y="4"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="4"
        y="13"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="13"
        y="13"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
        d="M7 3.5v3M17 3.5v3M3.5 9.5h17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PawIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <ellipse
        cx="8"
        cy="7"
        rx="2"
        ry="2.7"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <ellipse
        cx="16"
        cy="7"
        rx="2"
        ry="2.7"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <ellipse
        cx="17.5"
        cy="13"
        rx="2"
        ry="2.7"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <ellipse
        cx="6.5"
        cy="13"
        rx="2"
        ry="2.7"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 18.4c2 0 3.7-1.4 3.7-3.2 0-1.7-1.6-2.6-3.2-2.6-.8 0-1.5.2-2.1.6-.4.3-.9.4-1.5.4-1.5 0-2.7 1-2.7 2.4 0 1.3 1.1 2.3 2.6 2.3H12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 6v6l4 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M21 12a9 9 0 1 1-3.1-6.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15.3a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 12.1c.1-.4.1-.8.1-1.2s0-.8-.1-1.2l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2-.9L14.7 3h-5.4L9 5.9a8 8 0 0 0-2 .9l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 2 .9L9.3 21h5.4l.3-2.9a8 8 0 0 0 2-.9l2.4 1 2-3.5-2-1.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M15.5 8.2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        stroke="white"
        strokeWidth="1.8"
      />
      <path
        d="M7.7 12a2.1 2.1 0 1 0 0-4.2A2.1 2.1 0 0 0 7.7 12Z"
        stroke="white"
        strokeWidth="1.8"
      />
      <path
        d="M16.8 15.8a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z"
        stroke="white"
        strokeWidth="1.8"
      />
      <path
        d="M10.6 19.1c2 0 3.7-1.4 3.7-3.2 0-1.7-1.6-2.6-3.2-2.6-.8 0-1.4.2-2 .6-.5.3-1 .4-1.6.4-1.6 0-2.9 1-2.9 2.5 0 1.4 1.2 2.3 2.8 2.3h3.2Z"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="#64748B" strokeWidth="2" />
      <path
        d="m20 20-3.5-3.5"
        stroke="#64748B"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 18H6.5c.7-.8 1.5-2.2 1.5-4.8 0-3.2 1.8-5.2 4.5-5.2s4.5 2 4.5 5.2c0 2.6.8 4 1.5 4.8H15Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="M10 19.2a2.2 2.2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellSmallIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
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

function UserMenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M5 20c0-3.5 2.9-6 7-6s7 2.5 7 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 16l4-4-4-4M18 12H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <path d="M15.5 8.2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="white" strokeWidth="1.8" />
      <path d="M7.7 12a2.1 2.1 0 1 0 0-4.2A2.1 2.1 0 0 0 7.7 12Z" stroke="white" strokeWidth="1.8" />
      <path d="M16.8 15.8a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z" stroke="white" strokeWidth="1.8" />
      <path d="M10.6 19.1c2 0 3.7-1.4 3.7-3.2 0-1.7-1.6-2.6-3.2-2.6-.8 0-1.4.2-2 .6-.5.3-1 .4-1.6.4-1.6 0-2.9 1-2.9 2.5 0 1.4 1.2 2.3 2.8 2.3h3.2Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}