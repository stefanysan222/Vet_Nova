"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import SuperAdminSidebar from "../components/super-admin/Sidebar";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "SuperAdministrador") {
      const routes: Record<string, string> = {
        Administrador: "/admin",
        Veterinario: "/veterinario",
        Cliente: "/cliente",
      };
      router.replace(routes[user.role] ?? "/login");
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SuperAdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
