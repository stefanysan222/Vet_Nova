
"use client";
import { useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);

  const notifications = [
    { id: 1, text: "Cliente llegó a la clínica" },
    { id: 2, text: "Cita cancelada" },
    { id: 3, text: "Veterinario no disponible" },
    { id: 4, text: "Mascota sin historia clínica" },
  ];

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-gray-100"
        onClick={() => setOpen(!open)}
      >
        <Bell className="w-5 h-5 text-[#1e293b]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-[#ef4444] rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg border border-[#e2e8f0] z-50">
          <div className="p-2">
            {notifications.slice(0, 3).map(n => (
              <div key={n.id} className="p-2 rounded hover:bg-gray-100">
                {n.text}
              </div>
            ))}
          </div>
          <div className="border-t border-[#e2e8f0] p-2 text-center">
            <Link href="/recepcionista/notificaciones" className="text-sm font-bold text-[#2563eb] hover:underline">
              Ver más
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}