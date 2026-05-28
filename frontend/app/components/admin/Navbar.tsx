"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronDown, Search, LogOut, Settings, Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('vetnova-theme');
    if (savedTheme === null) {
      // No saved preference: follow system and listen for changes
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      if (prefersDark) document.documentElement.classList.add('dark');

      const listener = (e: MediaQueryListEvent) => {
        setDarkMode(e.matches);
        if (e.matches) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      };
      try {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
      } catch (e) {
        // fallback for older browsers
        window.matchMedia('(prefers-color-scheme: dark)').addListener(listener as any);
      }

      return () => {
        try {
          window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
        } catch (e) {
          window.matchMedia('(prefers-color-scheme: dark)').removeListener(listener as any);
        }
      };
    } else {
      const saved = savedTheme === 'dark';
      setDarkMode(saved);
      if (saved) document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('vetnova-theme', newMode ? 'dark' : 'light');
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const notifications = [
    { id: 1, title: "Nueva cita agendada", desc: "Ana Pérez - Consulta para Milo", time: "hace 2 min" },
    { id: 2, title: "Inventario bajo", desc: "Alimento premium con stock bajo", time: "hace 12 min" },
    { id: 3, title: "Usuario registrado", desc: "Nuevo recepcionista en el sistema", time: "hace 45 min" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl shadow-sm shadow-slate-900/5">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">Dashboard</span>
            <span className="text-slate-400">/</span>
            <span className="font-semibold text-slate-900">Administrador</span>
          </div>
          <p className="max-w-2xl text-sm text-slate-600">
            Bienvenido a VetNova. Supervisa la operación en tiempo real y gestiona tus recursos con facilidad.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block w-full sm:w-[320px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar pacientes, citas o usuarios"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3 pl-14 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="inline-flex h-12 items-center justify-center rounded-3xl bg-white px-4 text-slate-700 shadow-sm shadow-slate-200/60 transition hover:bg-slate-100 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-14 w-80 rounded-3xl border border-slate-200 bg-white shadow-xl z-50"
                >
                  <div className="border-b border-slate-200 p-4">
                    <h3 className="font-semibold text-slate-900">Notificaciones</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto space-y-2 p-3">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="rounded-2xl bg-slate-50 p-3 hover:bg-slate-100 transition cursor-pointer">
                        <p className="font-medium text-sm text-slate-900">{notif.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{notif.desc}</p>
                        <p className="text-xs text-slate-400 mt-2">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 p-3">
                    <button className="w-full text-center text-sm font-semibold text-blue-600 hover:text-blue-700">
                      Ver todas
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Admin Menu */}
          <div className="relative">
            <button
              onClick={() => setAdminMenuOpen(!adminMenuOpen)}
              className="inline-flex items-center gap-3 rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-700"
            >
              <span className="h-9 w-9 rounded-2xl bg-blue-500/10 text-blue-700 grid place-items-center">A</span>
              <span>Admin</span>
              <ChevronDown className={`h-4 w-4 transition ${adminMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Admin Menu Dropdown */}
            <AnimatePresence>
              {adminMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-14 w-48 rounded-3xl border border-slate-200 bg-white shadow-xl z-50"
                >
                  <button
                    onClick={toggleDarkMode}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 transition border-b border-slate-200"
                  >
                    <span className="flex items-center gap-3">
                      {darkMode ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                      {darkMode ? "Modo claro" : "Modo oscuro"}
                    </span>
                    <span className={`relative h-5 w-10 rounded-full transition ${darkMode ? "bg-blue-600" : "bg-slate-200"}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${darkMode ? "left-5" : "left-0.5"}`} />
                    </span>
                  </button>
                  <a
                    href="/admin/configuracion"
                    className="flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 transition border-b border-slate-200"
                  >
                    <Settings className="h-4 w-4" />
                    Configuración
                  </a>
                  <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition">
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
