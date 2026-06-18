"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";

type ClienteProfile = { nombre: string; apellido: string; email: string };

type ClienteProfileContextValue = {
  perfil: ClienteProfile;
  refrescar: () => Promise<void>;
};

function dividirNombre(nombreCompleto: string): { nombre: string; apellido: string } {
  const partes = nombreCompleto.trim().split(" ");
  return { nombre: partes[0] ?? "", apellido: partes.slice(1).join(" ") };
}

const ClienteProfileContext = createContext<ClienteProfileContextValue | null>(null);

export function ClienteProfileProvider({ children }: { children: ReactNode }) {
  const { user, refresh } = useAuth();
  const [perfil, setPerfil] = useState<ClienteProfile>({ nombre: "", apellido: "", email: "" });

  useEffect(() => {
    if (!user) return;
    const { nombre, apellido } = dividirNombre(user.name);
    // Sincroniza el perfil cuando AuthContext obtiene el usuario desde /auth/me
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPerfil({ nombre, apellido, email: user.email });
  }, [user]);

  const value = useMemo(() => ({ perfil, refrescar: refresh }), [perfil, refresh]);

  return <ClienteProfileContext.Provider value={value}>{children}</ClienteProfileContext.Provider>;
}

export function useClienteProfile(): ClienteProfileContextValue {
  const context = useContext(ClienteProfileContext);
  if (!context) {
    throw new Error("useClienteProfile debe usarse dentro de ClienteProfileProvider");
  }
  return context;
}
