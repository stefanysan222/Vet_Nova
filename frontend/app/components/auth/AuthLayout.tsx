"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bone,
  Cat,
  Dog,
  Heart,
  Moon,
  PawPrint,
  Pill,
  Stethoscope,
  Sun,
} from "lucide-react";

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const PET_ICONS = [PawPrint, Dog, Cat, Stethoscope, Pill, Bone, Heart];

function PetPattern() {
  const items = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    Icon: PET_ICONS[i % PET_ICONS.length],
    x: Math.round((i * 37 + 11) % 95),
    y: Math.round((i * 53 + 7) % 95),
    size: 1.1 + (i % 5) * 0.25,
    delay: (i % 8) * 0.4,
    duration: 4 + (i % 4),
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((item) => (
        <motion.span
          key={item.id}
          className="absolute select-none text-slate-900 opacity-[0.06] dark:text-white dark:opacity-[0.04]"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: `${item.size}rem`,
            height: `${item.size}rem`,
          }}
          animate={{ y: [0, -8, 0], rotate: [0, 6, -6, 0] }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <item.Icon className="h-full w-full" />
        </motion.span>
      ))}
    </div>
  );
}

export default function AuthLayout({ title, description, children }: AuthLayoutProps) {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("vetnova-theme");
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("vetnova-theme", next ? "dark" : "light");
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-50 via-surface-50 to-accent-50/30 py-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <PetPattern />

      <div className="relative mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 sm:px-6">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex w-full items-center justify-between"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <motion.button
            type="button"
            onClick={toggleDark}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 shadow-sm backdrop-blur-sm transition hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Cambiar tema"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.button>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-modal backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/90"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <Link href="/" className="inline-flex items-center">
              <div className="relative h-10 w-10 shrink-0">
                <Image
                  src="/logos/vetnova-wordmark-light.png"
                  alt="VetNova"
                  fill
                  sizes="40px"
                  className="block object-contain dark:hidden"
                />
                <Image
                  src="/logos/vetnova-wordmark-dark.png"
                  alt="VetNova"
                  fill
                  sizes="40px"
                  className="hidden object-contain dark:block"
                />
              </div>
            </Link>
            <div className="flex items-center gap-1.5 rounded-lg bg-brand-100 px-3 py-1.5 text-xs font-medium text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <PawPrint className="h-3.5 w-3.5" />
              Clínica veterinaria
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-7 sm:px-8">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {description}
                </p>
              )}
            </motion.div>
            <div className="mt-6">{children}</div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-slate-400 dark:text-slate-600"
        >
          © {new Date().getFullYear()} VetNova · Todos los derechos reservados
        </motion.p>
      </div>
    </section>
  );
}
