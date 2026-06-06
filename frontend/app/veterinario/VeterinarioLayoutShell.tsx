"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { getCurrentUser, clearCurrentUser } from "../../lib/auth";

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

const notificationPreview: { title: string; description: string; time: string; unread: boolean }[] =
  [];

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
  const [userName, setUserName] = useState(() => getCurrentUser()?.name ?? "Veterinario");
  const [userInitials, setUserInitials] = useState(() => {
    const name = getCurrentUser()?.name;
    return name
      ? name
          .split(" ")
          .map((p: string) => p[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "V";
  });

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("vetnova-theme") === "dark",
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const [busquedaGlobal, setBusquedaGlobal] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);

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
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "Veterinario") {
      const routes: Record<string, string> = {
        Administrador: "/admin",
        Cliente: "/cliente",
      };
      router.replace(routes[user.role] ?? "/login");
      return;
    }
  }, [router]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowNotifications(false);
    setShowUserMenu(false);
    setMostrarResultados(false);
    setBusquedaGlobal("");
  }, [pathname]);

  useEffect(() => {
    function cerrarElementosAbiertos(event: MouseEvent) {
      const target = event.target as Node;

      if (buscadorRef.current && !buscadorRef.current.contains(target)) {
        setMostrarResultados(false);
      }
    }

    document.addEventListener("mousedown", cerrarElementosAbiertos);

    return () => {
      document.removeEventListener("mousedown", cerrarElementosAbiertos);
    };
  }, []);

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
    <main className="h-screen overflow-hidden bg-[#F5F7FB] text-[#10213A] dark:bg-[#0B1120] dark:text-white">
      <div className="flex h-screen overflow-hidden">
        {/* SIDEBAR */}
        <aside className="hidden h-screen w-[215px] shrink-0 border-r border-[#E5EAF2] bg-white dark:border-[#1E293B] dark:bg-[#111827] lg:flex lg:flex-col">
          <div className="flex h-[78px] items-center gap-3 border-b border-[#E5EAF2] px-4 dark:border-[#1E293B]">
            <img
              src={darkMode ? "/logos/vetnova-logo-dark.png" : "/logos/vetnova-logo-light.png"}
              alt="VetNova"
              className="h-10 w-10 rounded-xl object-contain"
            />

            <div>
              <h1 className="text-[20px] font-bold leading-none text-[#10213A] dark:text-white">
                VetNova
              </h1>

              <p className="mt-1.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Sistema Veterinario
              </p>
            </div>
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

          <div className="border-t border-[#E5EAF2] px-3 py-5 dark:border-[#1E293B]">
            <button
              type="button"
              onClick={() => {
                clearCurrentUser();
                router.push("/login");
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-semibold text-[#10213A] transition hover:bg-[#F1F5F9] dark:text-white dark:hover:bg-[#1E293B]"
            >
              <AppIcon name="logout" />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* ÁREA PRINCIPAL */}
        <section className="min-w-0 flex-1">
          {/* TOPBAR */}
          <header className="relative z-40 flex h-[64px] items-center justify-between border-b border-[#E5EAF2] bg-white px-5 dark:border-[#1E293B] dark:bg-[#111827]">
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
            {/* BUSCADOR GLOBAL */}
            <div ref={buscadorRef} className="relative w-full max-w-[520px]">
              <div
                className={`flex h-[42px] items-center gap-3 rounded-xl border bg-white px-3 transition duration-200 dark:bg-[#0F172A] ${
                  mostrarResultados && busquedaGlobal.trim()
                    ? "border-[#2F6BFF] shadow-[0_0_0_4px_rgba(47,107,255,0.10)] dark:border-[#2563EB]"
                    : "border-[#CBD5E1] dark:border-[#334155]"
                }`}
              >
                <AppIcon name="search" className="h-[18px] w-[18px] text-[#64748B]" />

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
                  className="w-full bg-transparent text-[14px] text-[#10213A] outline-none placeholder:text-[#94A3B8] dark:text-white"
                />

                {busquedaGlobal && (
                  <button
                    type="button"
                    onClick={limpiarBusqueda}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[19px] text-[#64748B] transition hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
                    aria-label="Limpiar búsqueda"
                  >
                    ×
                  </button>
                )}
              </div>

              {mostrarResultados && busquedaGlobal.trim() !== "" && (
                <div className="absolute left-0 top-[50px] z-50 w-full overflow-hidden rounded-[18px] border border-[#E2E8F0] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.16)] dark:border-[#334155] dark:bg-[#111827]">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3 dark:border-[#334155]">
                    <div>
                      <p className="text-[13px] font-semibold text-[#10213A] dark:text-white">
                        Resultados de búsqueda
                      </p>

                      <p className="mt-1 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                        Presiona Enter para abrir el primer resultado
                      </p>
                    </div>

                    <span className="rounded-full bg-[#EEF4FF] px-3 py-1 text-[12px] font-semibold text-[#2563EB] dark:bg-[#1E293B] dark:text-[#93C5FD]">
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
                          className="group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#F5F9FF] dark:hover:bg-[#1E293B]"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#2563EB] transition group-hover:bg-[#DBEAFE] dark:bg-[#172554] dark:text-[#93C5FD]">
                            <AppIcon name={resultado.icon} className="h-[19px] w-[19px]" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-semibold text-[#10213A] dark:text-white">
                              {resultado.titulo}
                            </p>

                            <p className="mt-1 truncate text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                              {resultado.descripcion}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[11px] font-semibold text-[#64748B] dark:bg-[#0F172A] dark:text-[#CBD5E1]">
                            {resultado.categoria}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-8 text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B] dark:bg-[#1E293B] dark:text-[#94A3B8]">
                        <AppIcon name="search" className="h-5 w-5" />
                      </div>

                      <p className="mt-3 text-[14px] font-semibold text-[#10213A] dark:text-white">
                        No se encontraron resultados
                      </p>

                      <p className="mt-1 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                        Busca por paciente, cita, historial o módulo.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="ml-5 flex items-center gap-4">
              {/* NOTIFICACIONES */}
              <div className="relative">
                <button
                  type="button"
                  aria-label="Ver notificaciones"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                    setMostrarResultados(false);
                  }}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#10213A] transition hover:bg-[#F1F5F9] dark:text-white dark:hover:bg-[#1E293B]"
                >
                  <AppIcon name="bell" />

                  <span className="absolute right-[8px] top-[8px] h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-[52px] z-50 w-[380px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.15)] dark:border-[#334155] dark:bg-[#111827]">
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

                    <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                      {notificationPreview.map((notification) => (
                        <div
                          key={notification.title}
                          className="flex gap-3 px-5 py-4 transition hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                        >
                          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#2563EB]">
                            <AppIcon name="bell" className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-[14px] font-semibold text-[#10213A] dark:text-white">
                                {notification.title}
                              </p>

                              {notification.unread && (
                                <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
                              )}
                            </div>

                            <p className="mt-1 text-[13px] leading-5 text-[#64748B] dark:text-[#94A3B8]">
                              {notification.description}
                            </p>

                            <p className="mt-2 text-[12px] text-[#94A3B8]">{notification.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#E2E8F0] p-4 dark:border-[#334155]">
                      <Link
                        href="/veterinario/notificaciones"
                        className="flex h-[42px] items-center justify-center rounded-xl bg-[#2F6BFF] text-[14px] font-semibold text-white transition hover:bg-[#2459DF]"
                      >
                        Ver todas las notificaciones
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-[#E2E8F0] dark:bg-[#334155]" />

              {/* USUARIO */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                    setMostrarResultados(false);
                  }}
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                >
                  <div className="text-right">
                    <p className="text-[14px] font-semibold leading-none text-[#10213A] dark:text-white">
                      {userName}
                    </p>

                    <p className="mt-1.5 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                      Veterinario
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2F6BFF] text-[15px] font-semibold text-white">
                    {userInitials}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-[54px] z-50 w-[285px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.15)] dark:border-[#334155] dark:bg-[#111827]">
                    <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-5 py-4 dark:border-[#334155]">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2F6BFF] font-semibold text-white">
                        {userInitials}
                      </div>

                      <div>
                        <p className="text-[15px] font-semibold text-[#10213A] dark:text-white">
                          {userName}
                        </p>

                        <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
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
                        className="flex w-full items-center justify-between px-5 py-3 text-[14px] font-semibold text-[#10213A] transition hover:bg-[#F8FAFC] dark:text-white dark:hover:bg-[#1E293B]"
                      >
                        <span className="flex items-center gap-3">
                          <AppIcon name={darkMode ? "sun" : "moon"} />
                          {darkMode ? "Modo claro" : "Modo oscuro"}
                        </span>

                        <span
                          className={`relative h-[22px] w-[40px] rounded-full transition ${
                            darkMode ? "bg-[#2F6BFF]" : "bg-[#CBD5E1]"
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
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          clearCurrentUser();
                          router.push("/login");
                        }}
                        className="flex w-full items-center gap-3 px-5 py-3 text-[14px] font-semibold text-[#EF4444] transition hover:bg-[#FEF2F2] dark:hover:bg-[#3F1D1D]"
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
          <div className="h-[calc(100vh-64px)] overflow-y-auto bg-[#F5F7FB] px-6 py-6 dark:bg-[#0B1120]">
            {children}
          </div>
        </section>
      </div>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute left-0 top-0 h-full w-[215px] bg-white dark:bg-[#111827]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-[78px] items-center justify-between border-b border-[#E5EAF2] px-4 dark:border-[#1E293B]">
              <div className="flex items-center gap-3">
                <img
                  src={darkMode ? "/logos/vetnova-logo-dark.png" : "/logos/vetnova-logo-light.png"}
                  alt="VetNova"
                  className="h-10 w-10 rounded-xl object-contain"
                />
                <div>
                  <h1 className="text-[20px] font-bold leading-none text-[#10213A] dark:text-white">
                    VetNova
                  </h1>
                  <p className="mt-1.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Sistema Veterinario
                  </p>
                </div>
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
            <nav className="px-3 py-5">
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
            <div className="border-t border-[#E5EAF2] px-3 py-5 dark:border-[#1E293B]">
              <button
                type="button"
                onClick={() => {
                  clearCurrentUser();
                  router.push("/login");
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-semibold text-[#10213A] transition hover:bg-[#F1F5F9] dark:text-white dark:hover:bg-[#1E293B]"
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
      className={`mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-semibold transition ${
        active
          ? "bg-[#2F6BFF] text-white shadow-sm"
          : "text-[#10213A] hover:bg-[#F1F5F9] dark:text-white dark:hover:bg-[#1E293B]"
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
      className="flex items-center gap-3 px-5 py-3 text-[14px] font-semibold text-[#10213A] transition hover:bg-[#F8FAFC] dark:text-white dark:hover:bg-[#1E293B]"
    >
      <AppIcon name={icon} />
      {label}
    </Link>
  );
}

function AppIcon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const svgProps = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...svgProps}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...svgProps}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
          <path d="M7.5 3.5v3.5M16.5 3.5v3.5M3.5 9.5h17" />
        </svg>
      );

    case "patients":
      return (
        <svg {...svgProps}>
          <ellipse cx="8" cy="7" rx="2" ry="2.6" />
          <ellipse cx="16" cy="7" rx="2" ry="2.6" />
          <ellipse cx="6.5" cy="13" rx="2" ry="2.6" />
          <ellipse cx="17.5" cy="13" rx="2" ry="2.6" />
          <path d="M12 18.6c2.2 0 3.8-1.3 3.8-3 0-1.8-1.6-2.9-3.3-2.9-.8 0-1.5.2-2.1.7-.5.3-1 .4-1.5.4-1.5 0-2.7 1-2.7 2.4 0 1.4 1.2 2.4 2.8 2.4H12Z" />
        </svg>
      );

    case "consultation":
      return (
        <svg {...svgProps}>
          <path d="M9 4h6" />
          <path d="M9 3.5h6a1.5 1.5 0 0 1 1.5 1.5v1H7.5V5A1.5 1.5 0 0 1 9 3.5Z" />
          <rect x="5" y="6" width="14" height="15" rx="2" />
          <path d="M9 11h6M9 15h6M9 18h4" />
        </svg>
      );

    case "history":
      return (
        <svg {...svgProps}>
          <path d="M12 7v5l3.5 2" />
          <path d="M20.5 12a8.5 8.5 0 1 1-2.7-6.2" />
          <path d="M20.5 4.5v5h-5" />
        </svg>
      );

    case "profile":
      return (
        <svg {...svgProps}>
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M5 20c0-3.6 2.9-6 7-6s7 2.4 7 6" />
        </svg>
      );

    case "search":
      return (
        <svg {...svgProps}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.8-3.8" />
        </svg>
      );

    case "bell":
      return (
        <svg {...svgProps}>
          <path d="M18 16.8H6c1-1 1.7-2.3 1.7-5 0-2.8 1.8-5 4.3-5s4.3 2.2 4.3 5c0 2.7.7 4 1.7 5Z" />
          <path d="M10 19a2.2 2.2 0 0 0 4 0" />
        </svg>
      );

    case "logout":
      return (
        <svg {...svgProps}>
          <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
          <path d="m14 16 4-4-4-4M18 12H9" />
        </svg>
      );

    case "moon":
      return (
        <svg {...svgProps}>
          <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 8.5 8.5 0 1 0 21 14.5Z" />
        </svg>
      );

    case "sun":
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
  }
}

function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
