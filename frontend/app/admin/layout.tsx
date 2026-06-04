"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "Administrador") {
      const routes: Record<string, string> = {
        Veterinario: "/veterinario",
        Cliente: "/cliente",
        Recepcionista: "/recepcionista",
      };
      router.replace(routes[user.role] ?? "/login");
    }
  }, [router]);

  return <>{children}</>;
}
