"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle,
  Search,
  Moon,
  Sun,
  LayoutDashboard,
  Users2,
  CalendarDays,
  PawPrint,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { fetchUsuarios } from "../../../lib/api/usuarios";
import { fetchMascotas } from "../../../lib/api/mascotas";
import { fetchCitas } from "../../../lib/api/citas";
import {
  fetchNotificacionesCount,
  fetchNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
  type NotificacionAPI,
} from "../../../lib/api/notificaciones";

type SearchResult = {
  id: string;
  label: string;
  sublabel?: string;
  category: "Páginas" | "Usuarios" | "Mascotas" | "Citas";
  href: string;
};

const NAV_PAGES: SearchResult[] = [
  {
    id: "p-dashboard",
    label: "Dashboard",
    sublabel: "Panel principal",
    category: "Páginas",
    href: "/admin",
  },
  {
    id: "p-usuarios",
    label: "Usuarios",
    sublabel: "Gestión de usuarios",
    category: "Páginas",
    href: "/admin/usuarios",
  },
  {
    id: "p-citas",
    label: "Citas",
    sublabel: "Agenda de atención",
    category: "Páginas",
    href: "/admin/citas",
  },
  {
    id: "p-mascotas",
    label: "Mascotas",
    sublabel: "Registro de mascotas",
    category: "Páginas",
    href: "/admin/mascotas",
  },
  {
    id: "p-reportes",
    label: "Reportes",
    sublabel: "Resumen del sistema",
    category: "Páginas",
    href: "/admin/reportes",
  },
  {
    id: "p-notificaciones",
    label: "Notificaciones",
    sublabel: "Alertas del sistema",
    category: "Páginas",
    href: "/admin/notificaciones",
  },
  {
    id: "p-configuracion",
    label: "Configuración",
    sublabel: "Perfil y cuenta",
    category: "Páginas",
    href: "/admin/configuracion",
  },
];

const CATEGORY_ORDER: SearchResult["category"][] = ["Páginas", "Usuarios", "Mascotas", "Citas"];

const CATEGORY_ICON: Record<SearchResult["category"], React.ReactNode> = {
  Páginas: <LayoutDashboard className="h-3.5 w-3.5" />,
  Usuarios: <Users2 className="h-3.5 w-3.5" />,
  Mascotas: <PawPrint className="h-3.5 w-3.5" />,
  Citas: <CalendarDays className="h-3.5 w-3.5" />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Ahora";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  return `Hace ${Math.floor(h / 24)}d`;
}

export default function Navbar() {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifItems, setNotifItems] = useState<NotificacionAPI[] | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("vetnova-theme");
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Badge: contar no leídas al montar y cada 30s
  useEffect(() => {
    const load = () =>
      fetchNotificacionesCount()
        .then(setNotifCount)
        .catch(() => {});
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cargar lista al abrir el dropdown (null = cargando)
  useEffect(() => {
    if (!notifOpen) return;
    // Limpiar la lista (estado "cargando") antes de refetch al abrir el dropdown
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotifItems(null);
    let cancelled = false;
    fetchNotificaciones(true)
      .then((data) => {
        if (!cancelled) setNotifItems(data);
      })
      .catch(() => {
        if (!cancelled) setNotifItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [notifOpen]);

  const handleMarcarLeida = async (id: number) => {
    await marcarLeida(id).catch(() => {});
    setNotifItems((prev) => prev?.filter((n) => n.id !== id) ?? prev);
    setNotifCount((c) => Math.max(0, c - 1));
  };

  const handleMarcarTodas = async () => {
    await marcarTodasLeidas().catch(() => {});
    setNotifItems([]);
    setNotifCount(0);
  };

  // Tema — sincronizar DOM y escuchar cambios de sistema
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    const saved = localStorage.getItem("vetnova-theme");
    if (!saved) {
      const listener = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem("vetnova-theme")) {
          setDarkMode(e.matches);
          document.documentElement.classList.toggle("dark", e.matches);
        }
      };
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", listener);
      return () =>
        window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", listener);
    }
  }, [darkMode]);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("vetnova-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Búsqueda con debounce
  const doSearch = useCallback(async (q: string) => {
    const term = q.toLowerCase().trim();

    // Páginas (siempre local)
    const pageResults = NAV_PAGES.filter(
      (p) =>
        p.label.toLowerCase().includes(term) || (p.sublabel ?? "").toLowerCase().includes(term),
    );

    if (term.length < 2) {
      setResults(pageResults.slice(0, 5));
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      const [usuarios, mascotas, citas] = await Promise.all([
        fetchUsuarios().catch(() => []),
        fetchMascotas().catch(() => []),
        fetchCitas().catch(() => []),
      ]);

      const userResults: SearchResult[] = usuarios
        .filter(
          (u) =>
            (u.nombre ?? "").toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
        )
        .slice(0, 4)
        .map((u) => ({
          id: `u-${u.id}`,
          label: u.nombre ?? u.email,
          sublabel: `${u.rol} · ${u.email}`,
          category: "Usuarios",
          href: "/admin/usuarios",
        }));

      const petResults: SearchResult[] = mascotas
        .filter(
          (p) =>
            p.nombre.toLowerCase().includes(term) ||
            (p.propietarioNombre ?? "").toLowerCase().includes(term) ||
            (p.raza ?? "").toLowerCase().includes(term),
        )
        .slice(0, 4)
        .map((p) => ({
          id: `m-${p.id}`,
          label: p.nombre,
          sublabel: `${p.especie}${p.raza ? ` · ${p.raza}` : ""} · ${p.propietarioNombre || "Sin propietario"}`,
          category: "Mascotas",
          href: "/admin/mascotas",
        }));

      const citaResults: SearchResult[] = citas
        .filter(
          (c) =>
            c.petName.toLowerCase().includes(term) ||
            (c.service ?? "").toLowerCase().includes(term) ||
            (c.veterinarian ?? "").toLowerCase().includes(term) ||
            c.date.includes(term),
        )
        .slice(0, 4)
        .map((c) => ({
          id: `c-${c.id}`,
          label: c.petName,
          sublabel: `${c.date} · ${c.service || "Sin servicio"} · ${c.status}`,
          category: "Citas",
          href: "/admin/citas",
        }));

      setResults([...pageResults, ...userResults, ...petResults, ...citaResults]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    // Reiniciar el índice activo cada vez que cambia la búsqueda — flip de número sin cascada
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIdx(0);
    if (!query) {
      setResults([]);
      setOpen(false);
      return;
    }
    setOpen(true);
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const grouped = CATEGORY_ORDER.reduce<Record<string, SearchResult[]>>((acc, cat) => {
    const items = results.filter((r) => r.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  const flatResults = Object.values(grouped).flat();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flatResults.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && flatResults[activeIdx]) {
      router.push(flatResults[activeIdx].href);
      setQuery("");
      setOpen(false);
    }
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "A";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:px-8">
        {/* Buscador */}
        <div ref={searchRef} className="relative hidden w-full max-w-sm sm:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar citas, usuarios o mascotas..."
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
                {searching && results.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-400">Buscando...</p>
                ) : results.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-400">
                    Sin resultados para &quot;{query}&quot;
                  </p>
                ) : (
                  <div className="max-h-80 overflow-y-auto py-2">
                    {Object.entries(grouped).map(([cat, items]) => {
                      const catTyped = cat as SearchResult["category"];
                      return (
                        <div key={cat}>
                          <p className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                            {CATEGORY_ICON[catTyped]}
                            {cat}
                          </p>
                          {items.map((r) => {
                            const idx = flatResults.indexOf(r);
                            return (
                              <Link
                                key={r.id}
                                href={r.href}
                                onClick={() => {
                                  setQuery("");
                                  setOpen(false);
                                }}
                                className={`flex flex-col px-4 py-2.5 transition ${
                                  idx === activeIdx
                                    ? "bg-brand-50 dark:bg-brand-950/30"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}
                              >
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                  {r.label}
                                </span>
                                {r.sublabel && (
                                  <span className="text-xs text-slate-400 dark:text-slate-500">
                                    {r.sublabel}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Toggle dark mode */}
          <button
            onClick={toggleDark}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notificaciones */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Bell className="h-4 w-4" />
              {notifCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Notificaciones
                      </p>
                      {notifItems && notifItems.length > 0 && (
                        <button
                          onClick={handleMarcarTodas}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                        >
                          Marcar todas leídas
                        </button>
                      )}
                    </div>

                    {/* Lista */}
                    <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                      {notifItems === null ? (
                        <div className="space-y-2 p-3">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                            />
                          ))}
                        </div>
                      ) : notifItems.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                          Sin notificaciones nuevas.
                        </p>
                      ) : (
                        (notifItems as NotificacionAPI[]).map((n) => (
                          <div
                            key={n.id}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {n.titulo}
                              </p>
                              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                                {n.mensaje}
                              </p>
                              <p className="mt-1 text-[10px] text-slate-400">
                                {timeAgo(n.creadaEn)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleMarcarLeida(n.id)}
                              className="mt-0.5 shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
                              title="Marcar como leída"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
                      <Link
                        href="/admin/notificaciones"
                        onClick={() => setNotifOpen(false)}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        Ver todas →
                      </Link>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Usuario conectado */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
              {initials}
            </div>
            <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">
              {user?.name ?? "Admin"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
