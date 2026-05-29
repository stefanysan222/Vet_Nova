"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  description,
  children,
}: AuthLayoutProps) {
  return (
    <section className="min-h-screen bg-slate-50 py-4 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 dark:bg-slate-950 dark:ring-slate-800"
        >
          <div className="px-5 py-5 sm:px-6 sm:py-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm shadow-blue-200/80 dark:bg-slate-900 dark:text-white dark:shadow-slate-900/80">
                <Image
                  src="/logos/vetnova-logo-light.png"
                  alt="VetNova logo"
                  width={24}
                  height={24}
                  className="rounded-lg"
                />
                VetNova
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                <PawPrint className="h-4 w-4 text-blue-600" />
                Clínica Veterinaria
              </div>
            </div>

            <div className="max-w-full space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">{title}</h1>
              {description ? (
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
              ) : null}
            </div>

            <div className="mt-5">{children}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
