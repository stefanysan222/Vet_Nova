"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Home,
  PawPrint,
  Calendar,
  FileText,
  Syringe,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

const menuItems = [
  { icon: Home, label: "Inicio", href: "/cliente" },
  { icon: PawPrint, label: "Mis Mascotas", href: "/cliente/mascotas" },
  { icon: Calendar, label: "Agendar Cita", href: "/cliente/agendar" },
  { icon: FileText, label: "Historial Médico", href: "/cliente/historial" },
  { icon: Syringe, label: "Vacunas", href: "/cliente/vacunas" },
  { icon: Bell, label: "Notificaciones", href: "/cliente/notificaciones" },
  { icon: User, label: "Perfil", href: "/cliente/perfil" },
];

export default function ClientSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 rounded-lg bg-white p-2 shadow-md lg:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-gray-900 text-white shadow-lg transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col border-r border-slate-200">
          <div className="border-b border-slate-200 px-6 py-8">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                <img
                  src="/logos/vetnova-logo-light.png"
                  alt="VetNova"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">VetNova</h1>
                <p className="text-xs text-slate-500">Sistema Veterinario</p>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
                <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                  JC
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Juan Carlos</p>
                <p className="text-xs text-slate-500">Cliente Premium</p>
              </div>
              <ChevronDown size={18} className="text-slate-400" />
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 px-4 py-6">
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-red-50 hover:text-red-600">
              <LogOut size={20} />
              <span className="font-medium">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
