"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Moon, Search, Sun, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useClickOutside } from "@/lib/hooks/useClickOutside";
import { fetchClinicas, type Clinica } from "../../../lib/api/clinicas";

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export default function SuperAdminTopbar() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("vetnova-theme");
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetchClinicas()
      .then(setClinicas)
      .catch(() => setClinicas([]));
  }, []);

  useClickOutside(searchRef, () => setOpen(false));

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("vetnova-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  const term = normalizar(query.trim());
  const results = term
    ? clinicas
        .filter((c) => normalizar(`${c.nombre} ${c.slug} ${c.email}`).includes(term))
        .slice(0, 6)
    : [];

  const goToClinica = (id: number) => {
    setQuery("");
    setOpen(false);
    const row = document.getElementById(`clinica-row-${id}`);
    if (!row) return;
    row.scrollIntoView({ behavior: "smooth", block: "center" });
    row.classList.add("bg-violet-50", "dark:bg-violet-900/30");
    setTimeout(() => {
      row.classList.remove("bg-violet-50", "dark:bg-violet-900/30");
    }, 1500);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SA";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:px-8">
        {/* Buscador */}
        <div ref={searchRef} className="relative hidden w-full max-w-sm sm:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(e.target.value.trim().length > 0);
            }}
            onFocus={() => {
              if (query.trim()) setOpen(true);
            }}
            placeholder="Buscar clínicas..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-8 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Dropdown resultados */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full mt-2 w-full min-w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
              >
                {results.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-400">
                    Sin resultados para &quot;{query}&quot;
                  </p>
                ) : (
                  <div className="max-h-80 overflow-y-auto py-2">
                    {results.map((c) => (
                      <Link
                        key={c.id}
                        href="/super-admin"
                        onClick={(e) => {
                          e.preventDefault();
                          goToClinica(c.id);
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
                            {c.nombre}
                          </span>
                          <span className="block truncate text-xs text-slate-400 dark:text-slate-500">
                            /register?clinica={c.slug}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleDark}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white dark:bg-brand-300 dark:text-brand-950">
              {initials}
            </div>
            <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">
              {user?.name ?? "Super Administrador"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
