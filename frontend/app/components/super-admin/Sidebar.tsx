"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, LogOut, ShieldCheck } from "lucide-react";
import { logout } from "../../../lib/auth";
import { useAuth } from "@/lib/auth-context";

const menuItems = [{ label: "Veterinarias", icon: Building2, href: "/super-admin" }];

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="hidden lg:flex lg:h-screen lg:w-[260px] lg:flex-col lg:border-r lg:border-slate-200/70 lg:bg-white lg:px-4 lg:py-6 dark:lg:border-slate-800 dark:lg:bg-slate-950">
      {/* Perfil */}
      <div className="mb-6 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
            {user?.name
              ? user.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "SA"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {user?.name ?? "Super Administrador"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Super Administrador</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-6 space-y-3 border-t border-slate-200/70 pt-4 dark:border-slate-800">
        <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
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
  );
}
