"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";

const PROFILE_STORAGE_KEY = "vetnova_cliente_perfil";

type AvatarSize = "small" | "medium";

type PerfilCliente = {
  nombre: string;
  apellido: string;
  foto: string | null;
};

type AvatarClienteProps = {
  size?: AvatarSize;
};

export default function AvatarCliente({
  size = "medium",
}: AvatarClienteProps) {
  const [perfil, setPerfil] = useState<PerfilCliente>({ nombre: "", apellido: "", foto: null });

  useEffect(() => {
    const cargarPerfil = () => {
      const user = getCurrentUser();
      const partes = (user?.name ?? "").trim().split(" ");
      const nombreJWT = partes[0] ?? "";
      const apellidoJWT = partes.slice(1).join(" ");

      const informacionGuardada = localStorage.getItem(PROFILE_STORAGE_KEY);

      if (!informacionGuardada) {
        setPerfil({ nombre: nombreJWT, apellido: apellidoJWT, foto: null });
        return;
      }

      try {
        const datos = JSON.parse(informacionGuardada) as Partial<PerfilCliente>;

        setPerfil({
          nombre: datos.nombre || nombreJWT,
          apellido: datos.apellido || apellidoJWT,
          foto: datos.foto || null,
        });
      } catch {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
        setPerfil({ nombre: nombreJWT, apellido: apellidoJWT, foto: null });
      }
    };

    cargarPerfil();

    window.addEventListener("vetnova-profile-updated", cargarPerfil);
    window.addEventListener("storage", cargarPerfil);

    return () => {
      window.removeEventListener("vetnova-profile-updated", cargarPerfil);
      window.removeEventListener("storage", cargarPerfil);
    };
  }, []);

  const iniciales = `${perfil.nombre.charAt(0)}${perfil.apellido.charAt(0)}`;

  const sizeClass =
    size === "small"
      ? "h-9 w-9 text-[14px]"
      : "h-[48px] w-[48px] text-[17px]";

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-600 font-semibold text-white ${sizeClass}`}
    >
      {perfil.foto ? (
        <Image
          src={perfil.foto}
          alt="Foto de perfil"
          fill
          unoptimized
          className="object-cover"
        />
      ) : (
        iniciales
      )}
    </div>
  );
}