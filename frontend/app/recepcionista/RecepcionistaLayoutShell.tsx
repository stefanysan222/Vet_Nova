"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Home,
  Languages,
  LogOut,
  Menu,
  Package,
  PawPrint,
  Search,
  Settings,
  Stethoscope,
  UserRound,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { getCurrentUser, clearCurrentUser } from "../../lib/auth";

type RecepcionistaLayoutShellProps = {
  children: ReactNode;
};

const menuItems = [
  {
    label: "Dashboard",
    href: "/recepcionista",
    icon: Home,
  },
  {
    label: "Agenda / Citas",
    href: "/recepcionista/citas",
    icon: CalendarDays,
  },
  {
    label: "Clientes",
    href: "/recepcionista/clientes",
    icon: UsersRound,
  },
  {
    label: "Mascotas",
    href: "/recepcionista/mascotas",
    icon: PawPrint,
  },
  {
    label: "Veterinarios",
    href: "/recepcionista/veterinarios",
    icon: Stethoscope,
  },
  {
    label: "Servicios",
    href: "/recepcionista/servicios",
    icon: Wrench,
  },
  {
    label: "Notificaciones",
    href: "/recepcionista/notificaciones",
    icon: Bell,
  },
  {
    label: "Inventario",
    href: "/recepcionista/inventario",
    icon: Package,
  },
  {
    label: "Reportes",
    href: "/recepcionista/reportes",
    icon: BarChart3,
  },
  {
    label: "Configuración",
    href: "/recepcionista/configuracion",
    icon: Settings,
  },
];

export function RecepcionistaLayoutShell({
  children,
}: RecepcionistaLayoutShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "Recepcionista") {
      const routes: Record<string, string> = {
        Administrador: "/admin",
        Veterinario: "/veterinario",
        Cliente: "/cliente",
      };
      router.replace(routes[user.role] ?? "/login");
    }
  }, [router]);

  function handleLogout() {
    clearCurrentUser();
    router.push("/login");
  }

  const activeTitle = useMemo(() => {
    const activeItem = menuItems.find((item) => {
      if (item.href === "/recepcionista") return pathname === item.href;
      return pathname.startsWith(item.href);
    });

    return activeItem?.label ?? "Recepción";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b]">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] border-r border-[#e2e8f0] bg-white lg:block">
        <SidebarContent pathname={pathname} onLogout={handleLogout} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-[#1e293b]/40 lg:hidden">
          <div className="h-full w-[285px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-4">
              <Brand />

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl p-2 text-[#64748b] transition hover:bg-[#eff6ff] hover:text-[#2563eb]"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <SidebarContent
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      <main className="min-h-screen lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-[#e2e8f0] bg-white/95 px-4 py-3 backdrop-blur md:px-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-[#e2e8f0] bg-white p-2 text-[#64748b] transition hover:bg-[#eff6ff] hover:text-[#2563eb] lg:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#2563eb]">
                  Panel recepcionista
                </p>

                <h1 className="text-xl font-black text-[#1e293b] md:text-2xl">
                  {activeTitle}
                </h1>
              </div>
            </div>

            <div className="hidden h-11 w-full max-w-[430px] items-center gap-3 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-4 md:flex">
              <Search className="h-4 w-4 text-[#64748b]" />

              <input
                type="text"
                placeholder="Buscar clientes, mascotas, citas o veterinarios..."
                className="w-full bg-transparent text-sm font-medium text-[#1e293b] outline-none placeholder:text-[#94a3b8]"
              />
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/recepcionista/notificaciones"
                className="relative rounded-xl border border-[#e2e8f0] bg-white p-2.5 text-[#1e293b] transition hover:bg-[#eff6ff] hover:text-[#2563eb]"
                aria-label="Ver notificaciones"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#ef4444]" />
              </Link>

              <Link
                href="/recepcionista/configuracion"
                className="hidden items-center gap-3 border-l border-[#e2e8f0] pl-4 md:flex"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white">
                  <UserRound className="h-5 w-5" />
                </div>

                <div className="leading-tight">
                  <p className="text-sm font-black text-[#1e293b]">
                    Recepción
                  </p>
                  <p className="text-xs font-semibold text-[#64748b]">
                    Turno activo
                  </p>
                </div>

                <ChevronDown className="h-4 w-4 text-[#64748b]" />
              </Link>
            </div>
          </div>
        </header>

        <section className="p-4 md:p-7">{children}</section>
      </main>
    </div>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
  onLogout,
}: {
  pathname: string;
  onNavigate?: () => void;
  onLogout?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#e2e8f0] px-4 py-5">
        <Brand />
      </div>

      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-5">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/recepcionista"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={[
                "group flex h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-bold transition-all duration-200",
                isActive
                  ? "bg-[#eff6ff] text-[#2563eb] shadow-sm"
                  : "text-[#1e293b] hover:bg-[#f8fafc] hover:text-[#2563eb]",
              ].join(" ")}
            >
              <Icon
                className={[
                  "h-[18px] w-[18px]",
                  isActive
                    ? "text-[#2563eb]"
                    : "text-[#64748b] group-hover:text-[#2563eb]",
                ].join(" ")}
              />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-4">
        <div className="rounded-2xl bg-[#f8fafc] p-4">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb]">
            <ClipboardList className="h-5 w-5" />
          </div>

          <p className="text-sm font-black text-[#1e293b]">
            Resumen del día
          </p>

          <p className="mt-1 text-xs leading-5 text-[#64748b]">
            Revisa citas, pacientes en espera, recordatorios y alertas importantes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { onNavigate?.(); onLogout?.(); }}
          className="mt-4 flex h-[44px] w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-[#ef4444] transition hover:bg-[#fef2f2]"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Cerrar sesión
        </button>

        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#94a3b8]">
          <Languages className="h-4 w-4" />
          VetNova © Recepción
        </div>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow-sm shadow-[#2563eb]/30">
        <Stethoscope className="h-6 w-6" />
      </div>

      <div>
        <p className="text-xl font-black leading-none text-[#1e293b]">
          VetNova
        </p>

        <p className="mt-1 text-xs font-semibold text-[#64748b]">
          Recepción
        </p>
      </div>
    </div>
  );
}