"use client";

import type { ReactNode } from "react";
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
    <section className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70"
        >
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="mb-8 inline-flex items-center gap-3 rounded-3xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-200/80">
              <PawPrint className="h-5 w-5" />
              VetNova
            </div>

            <div className="max-w-xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
              {description ? (
                <p className="text-base leading-7 text-slate-600">{description}</p>
              ) : null}
            </div>

            <div className="mt-10">{children}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
