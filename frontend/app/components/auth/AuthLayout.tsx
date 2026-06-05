"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, PawPrint } from "lucide-react";

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <section className="min-h-screen bg-surface-50 py-6 dark:bg-surface-950">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 sm:px-6">

        {/* Volver */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-surface-500 transition hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card-lg dark:border-surface-800 dark:bg-surface-950"
        >
          {/* Header de la tarjeta */}
          <div className="flex items-center justify-between border-b border-surface-100 px-6 py-4 dark:border-surface-800">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="relative h-8 w-8 shrink-0">
                <Image
                  src="/logos/vetnova-logo-light.png"
                  alt="VetNova"
                  width={32}
                  height={32}
                  className="block rounded-lg object-contain dark:hidden"
                />
                <Image
                  src="/logos/vetnova-logo-dark.png"
                  alt="VetNova"
                  width={32}
                  height={32}
                  className="hidden rounded-lg object-contain dark:block"
                />
              </div>
              <span className="text-sm font-semibold text-surface-900 dark:text-white">VetNova</span>
            </Link>
            <div className="flex items-center gap-1.5 rounded-lg bg-vet-50 px-3 py-1.5 text-xs font-medium text-vet-700 dark:bg-vet-900/30 dark:text-vet-400">
              <PawPrint className="h-3.5 w-3.5" />
              Clínica veterinaria
            </div>
          </div>

          {/* Contenido */}
          <div className="px-6 py-7 sm:px-8">
            <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-sm leading-6 text-surface-500 dark:text-surface-400">
                {description}
              </p>
            )}
            <div className="mt-6">{children}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
