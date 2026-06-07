"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchMe, getCurrentUser, type AuthUser } from "@/lib/auth";

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
  const [perfil, setPerfil] = useState<ClienteProfile>(() => {
    const user = getCurrentUser();
    const { nombre, apellido } = dividirNombre(user?.name ?? "");
    return { nombre, apellido, email: user?.email ?? "" };
  });

  const refrescar = useCallback(async () => {
    try {
      const me: AuthUser = await fetchMe();
      const { nombre, apellido } = dividirNombre(me.name);
      setPerfil({ nombre, apellido, email: me.email });
    } catch {
      // Si /auth/me falla se conserva el perfil derivado del JWT
    }
  }, []);

  useEffect(() => {
    // Carga el perfil real desde /auth/me al montar el provider
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refrescar();
  }, [refrescar]);

  return (
    <ClienteProfileContext.Provider value={{ perfil, refrescar }}>
      {children}
    </ClienteProfileContext.Provider>
  );
}

export function useClienteProfile(): ClienteProfileContextValue {
  const context = useContext(ClienteProfileContext);
  if (!context) {
    throw new Error("useClienteProfile debe usarse dentro de ClienteProfileProvider");
  }
  return context;
}
