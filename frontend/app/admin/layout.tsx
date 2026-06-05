"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getCurrentUser } from "../../lib/auth";
import Sidebar from "../components/admin/Sidebar";
import Navbar from "../components/admin/Navbar";

function PageTransition({ children, pathname }: { children: ReactNode; pathname: string }) {
  return (
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
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

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
      };
      router.replace(routes[user.role] ?? "/login");
    }
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <PageTransition pathname={pathname}>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
