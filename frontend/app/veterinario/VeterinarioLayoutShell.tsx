"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { logout } from "../../lib/auth";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useClickOutside } from "@/lib/hooks/useClickOutside";
import {
  LayoutDashboard,
  CalendarDays,
  PawPrint,
  ClipboardList,
  History,
  User,
  Search,
  Bell,
  Check,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

type IconName =
  | "dashboard"
  | "calendar"
  | "patients"
  | "consultation"
  | "history"
  | "profile"
  | "search"
  | "bell"
  | "logout"
  | "moon"
  | "sun";

type CategoriaResultado = "Paciente" | "Historial clínico" | "Consulta" | "Módulo";

interface ResultadoBusqueda {
  id: string;
  categoria: CategoriaResultado;
  titulo: string;
  descripcion: string;
  palabrasClave: string;
  href: string;
  icon: IconName;
}

const navigation: {
  label: string;
  href: string;
  icon: IconName;
}[] = [
  {
    label: "Dashboard",
    href: "/veterinario",
    icon: "dashboard",
  },
  {
    label: "Citas",
    href: "/veterinario/citas",
    icon: "calendar",
  },
  {
    label: "Pacientes",
    href: "/veterinario/mascotas",
    icon: "patients",
  },
  {
    label: "Historial Clínico",
    href: "/veterinario/historial",
    icon: "history",
  },
  {
    label: "Mi perfil",
    href: "/veterinario/configuracion",
    icon: "profile",
  },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Ahora";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  return `Hace ${Math.floor(h / 24)}d`;
}

const elementosBusqueda: ResultadoBusqueda[] = [
  {
    id: "modulo-dashboard",
    categoria: "Módulo",
    titulo: "Dashboard",
    descripcion: "Resumen general del veterinario",
    palabrasClave: "inicio dashboard panel resumen principal",
    href: "/veterinario",
    icon: "dashboard",
  },
  {
    id: "modulo-citas",
    categoria: "Módulo",
    titulo: "Citas",
    descripcion: "Consultar agenda veterinaria",
    palabrasClave: "citas agenda diaria programadas solicitud",
    href: "/veterinario/citas",
    icon: "calendar",
  },
  {
    id: "modulo-pacientes",
    categoria: "Módulo",
    titulo: "Pacientes",
    descripcion: "Consultar pacientes asignados y atendidos",
    palabrasClave: "pacientes mascotas atendidos asignados",
    href: "/veterinario/mascotas",
    icon: "patients",
  },
  {
    id: "modulo-historial",
    categoria: "Módulo",
    titulo: "Historial Clínico",
    descripcion: "Consultar expedientes médicos",
    palabrasClave: "historial clinico historias expedientes documentos",
    href: "/veterinario/historial",
    icon: "history",
  },
  {
    id: "modulo-consulta",
    categoria: "Módulo",
    titulo: "Registrar consulta",
    descripcion: "Documentar atención y tratamiento",
    palabrasClave: "registrar consulta tratamiento atencion clinica diagnostico",
    href: "/veterinario/consulta",
    icon: "consultation",
  },
  {
    id: "modulo-perfil",
    categoria: "Módulo",
    titulo: "Mi perfil",
    descripcion: "Información personal y seguridad",
    palabrasClave: "perfil configuracion seguridad contraseña informacion personal",
    href: "/veterinario/configuracion",
    icon: "profile",
  },
];

export default function VeterinarioLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const buscadorRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();
  const userName = user?.name ?? "Veterinario";
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((p: string) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "V";

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("vetnova-theme") === "dark",
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const [busquedaGlobal, setBusquedaGlobal] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const {
    count: notifCount,
    items: notifItems,
    loadItems: loadNotifItems,
    marcarLeida,
    marcarTodasLeidas,
  } = useNotifications({ enabled: !!user });

  const resultadosBusqueda = useMemo(() => {
    const termino = normalizarTexto(busquedaGlobal.trim());

    if (!termino) {
      return [];
    }

    return elementosBusqueda
      .filter((resultado) => {
        const contenido = normalizarTexto(
          `${resultado.titulo} ${resultado.descripcion} ${resultado.palabrasClave}`,
        );

        return contenido.includes(termino);
      })
      .slice(0, 8);
  }, [busquedaGlobal]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "Veterinario") {
      const routes: Record<string, string> = {
        SuperAdministrador: "/super-admin",
        Administrador: "/admin",
        Cliente: "/cliente",
      };
      router.replace(routes[user.role] ?? "/login");
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    // Cerrar menús/búsqueda al cambiar de ruta — flips de booleano/string sin riesgo de cascada
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowNotifications(false);
    setShowUserMenu(false);
    setMostrarResultados(false);
    setBusquedaGlobal("");
  }, [pathname]);

  useClickOutside(buscadorRef, () => setMostrarResultados(false));
  useClickOutside(notifRef, () => setShowNotifications(false));
  useClickOutside(userMenuRef, () => setShowUserMenu(false));

  // Cargar lista al abrir el dropdown
  useEffect(() => {
    if (!showNotifications) return;
    loadNotifItems();
  }, [showNotifications, loadNotifItems]);

  function toggleDarkMode() {
    const nuevoTema = !darkMode;

    setDarkMode(nuevoTema);
    document.documentElement.classList.toggle("dark", nuevoTema);
    localStorage.setItem("vetnova-theme", nuevoTema ? "dark" : "light");
  }

  function isActive(href: string) {
    if (href === "/veterinario") {
      return pathname === "/veterinario";
    }

    return pathname.startsWith(href);
  }

  function limpiarBusqueda() {
    setBusquedaGlobal("");
    setMostrarResultados(false);
  }

  function abrirResultado(resultado: ResultadoBusqueda) {
    limpiarBusqueda();
    router.push(resultado.href);
  }

  function handleTeclaBuscador(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setMostrarResultados(false);
      return;
    }

    if (event.key === "Enter" && resultadosBusqueda.length > 0) {
      event.preventDefault();
      abrirResultado(resultadosBusqueda[0]);
    }
  }

  return (
    <main className="h-dvh overflow-hidden bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-white">
      <div className="flex h-dvh overflow-hidden">
        {/* SIDEBAR */}
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

          <nav className="flex-1 px-3 py-5">
            {navigation.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
              />
            ))}
          </nav>

          <div className="border-t border-surface-200 px-3 py-5 dark:border-surface-800">
            <button
              type="button"
              onClick={() => {
                logout().then(() => router.push("/login"));
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-surface-900 transition hover:bg-surface-100 dark:text-white dark:hover:bg-surface-800"
            >
              <AppIcon name="logout" />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* ÁREA PRINCIPAL */}
        <section className="min-w-0 flex-1">
          {/* TOPBAR */}
          <header className="relative z-40 flex h-[64px] items-center justify-between border-b border-surface-200 bg-white px-5 dark:border-surface-800 dark:bg-surface-900">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900 lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* BUSCADOR GLOBAL */}
            <div
              ref={buscadorRef}
              className="relative w-full min-w-0 max-w-full sm:max-w-[420px] lg:max-w-[520px]"
            >
              <div className="flex h-[42px] items-center gap-3 rounded-xl border border-surface-300 bg-white px-4 transition-all focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 dark:border-surface-700 dark:bg-surface-900 dark:focus-within:border-brand-500">
                <Search className="h-[18px] w-[18px] shrink-0 text-surface-500 dark:text-surface-400" />

                <input
                  type="text"
                  value={busquedaGlobal}
                  onChange={(event) => {
                    setBusquedaGlobal(event.target.value);
                    setMostrarResultados(true);
                  }}
                  onFocus={() => setMostrarResultados(true)}
                  onKeyDown={handleTeclaBuscador}
                  placeholder="Buscar pacientes, citas o historiales..."
                  className="w-full bg-transparent text-sm text-surface-900 outline-none placeholder:text-surface-400 dark:text-white"
                />

                {busquedaGlobal && (
                  <button
                    type="button"
                    onClick={limpiarBusqueda}
                    className="text-surface-400 transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="h-[17px] w-[17px]" />
                  </button>
                )}
              </div>

              {mostrarResultados && busquedaGlobal.trim() !== "" && (
                <div className="absolute left-0 top-[50px] z-50 w-full overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900">
                  <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3 dark:border-surface-700">
                    <div>
                      <p className="text-sm font-semibold text-surface-900 dark:text-white">
                        Resultados de búsqueda
                      </p>

                      <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                        Presiona Enter para abrir el primer resultado
                      </p>
                    </div>

                    <span className="rounded-lg bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                      {resultadosBusqueda.length}
                    </span>
                  </div>

                  {resultadosBusqueda.length > 0 ? (
                    <div className="max-h-[390px] overflow-y-auto py-2">
                      {resultadosBusqueda.map((resultado) => (
                        <button
                          key={resultado.id}
                          type="button"
                          onClick={() => abrirResultado(resultado)}
                          className="group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-50 dark:hover:bg-surface-800"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 transition group-hover:bg-brand-200 dark:bg-brand-900/40 dark:text-brand-300">
                            <AppIcon name={resultado.icon} className="h-[19px] w-[19px]" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-surface-900 dark:text-white">
                              {resultado.titulo}
                            </p>

                            <p className="mt-1 truncate text-xs text-surface-500 dark:text-surface-400">
                              {resultado.descripcion}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-lg bg-surface-100 px-2.5 py-1 text-xs font-semibold text-surface-500 dark:bg-surface-800 dark:text-surface-300">
                            {resultado.categoria}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-8 text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400">
                        <AppIcon name="search" className="h-5 w-5" />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-surface-900 dark:text-white">
                        No se encontraron resultados
                      </p>

                      <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                        Busca por paciente, cita, historial o módulo.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="ml-5 flex items-center gap-4">
              {/* NOTIFICACIONES */}
              <div ref={notifRef} className="relative">
                <button
                  type="button"
                  aria-label="Ver notificaciones"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                    setMostrarResultados(false);
                  }}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl text-surface-900 transition hover:bg-surface-100 dark:text-white dark:hover:bg-surface-800"
                >
                  <AppIcon name="bell" />

                  {notifCount > 0 && (
                    <span className="absolute right-[6px] top-[6px] flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-surface-900">
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-[52px] z-50 w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900 sm:w-[380px]">
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
                          onClick={() => marcarTodasLeidas()}
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
                            className="flex gap-3 px-5 py-4 transition hover:bg-surface-50 dark:hover:bg-surface-800"
                          >
                            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                              <AppIcon name="bell" className="h-[18px] w-[18px]" />
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
                              onClick={() => marcarLeida(item.id)}
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
                        href="/veterinario/notificaciones"
                        onClick={() => setShowNotifications(false)}
                        className="flex h-[42px] items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-700"
                      >
                        Ver todas las notificaciones
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-surface-200 dark:bg-surface-700" />

              {/* USUARIO */}
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                    setMostrarResultados(false);
                  }}
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-surface-50 dark:hover:bg-surface-800"
                >
                  <div className="text-right">
                    <p className="text-sm font-semibold leading-none text-surface-900 dark:text-white">
                      {userName}
                    </p>

                    <p className="text-caption mt-1.5">Veterinario</p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                    {userInitials}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-[54px] z-50 w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900 sm:w-[285px]">
                    <div className="flex items-center gap-3 border-b border-surface-200 px-5 py-4 dark:border-surface-700">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 font-semibold text-white">
                        {userInitials}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-surface-900 dark:text-white">
                          {userName}
                        </p>

                        <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                          Veterinario
                        </p>
                      </div>
                    </div>

                    <div className="py-2">
                      <DropdownLink
                        href="/veterinario/configuracion"
                        icon="profile"
                        label="Mi perfil"
                      />

                      <DropdownLink
                        href="/veterinario/mascotas"
                        icon="patients"
                        label="Pacientes"
                      />

                      <DropdownLink
                        href="/veterinario/citas"
                        icon="calendar"
                        label="Agenda diaria"
                      />

                      <button
                        type="button"
                        onClick={toggleDarkMode}
                        className="flex w-full items-center justify-between px-5 py-3 text-sm font-semibold text-surface-900 transition hover:bg-surface-50 dark:text-white dark:hover:bg-surface-800"
                      >
                        <span className="flex items-center gap-3">
                          <AppIcon name={darkMode ? "sun" : "moon"} />
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
                        className="dark:hover:bg-danger-950/30 flex w-full items-center gap-3 px-5 py-3 text-sm font-semibold text-danger-500 transition hover:bg-danger-50"
                      >
                        <AppIcon name="logout" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* CONTENIDO */}
          <div className="h-[calc(100dvh-64px)] overflow-y-auto bg-surface-50 px-4 py-4 dark:bg-surface-950 sm:px-6 sm:py-6">
            {children}
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
            <nav className="flex-1 px-3 py-5">
              {navigation.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isActive(item.href)}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </nav>
            <div className="border-t border-surface-200 px-3 py-5 dark:border-surface-800">
              <button
                type="button"
                onClick={() => {
                  logout().then(() => router.push("/login"));
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-surface-900 transition hover:bg-surface-100 dark:text-white dark:hover:bg-surface-800"
              >
                <AppIcon name="logout" />
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
  label,
  href,
  icon,
  active,
  onClick,
}: {
  label: string;
  href: string;
  icon: IconName;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-brand-600 text-white shadow-brand-sm"
          : "text-surface-900 hover:bg-surface-100 dark:text-white dark:hover:bg-surface-800"
      }`}
    >
      <AppIcon name={icon} />
      {label}
    </Link>
  );
}

function DropdownLink({ href, icon, label }: { href: string; icon: IconName; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-surface-900 transition hover:bg-surface-50 dark:text-white dark:hover:bg-surface-800"
    >
      <AppIcon name={icon} />
      {label}
    </Link>
  );
}

const ICONS: Record<IconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  calendar: CalendarDays,
  patients: PawPrint,
  consultation: ClipboardList,
  history: History,
  profile: User,
  search: Search,
  bell: Bell,
  logout: LogOut,
  moon: Moon,
  sun: Sun,
};

function AppIcon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const Icon = ICONS[name];
  return <Icon className={className} strokeWidth={1.8} />;
}

function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
