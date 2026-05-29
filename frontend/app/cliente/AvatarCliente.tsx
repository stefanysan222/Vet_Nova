"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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

const perfilInicial: PerfilCliente = {
  nombre: "Juan",
  apellido: "Pérez",
  foto: null,
};

export default function AvatarCliente({
  size = "medium",
}: AvatarClienteProps) {
  const [perfil, setPerfil] = useState<PerfilCliente>(perfilInicial);

  useEffect(() => {
    const cargarPerfil = () => {
      const informacionGuardada = localStorage.getItem(PROFILE_STORAGE_KEY);

      if (!informacionGuardada) {
        setPerfil(perfilInicial);
        return;
      }

      try {
        const datos = JSON.parse(informacionGuardada) as Partial<PerfilCliente>;

        setPerfil({
          nombre: datos.nombre || "Juan",
          apellido: datos.apellido || "Pérez",
          foto: datos.foto || null,
        });
      } catch {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
        setPerfil(perfilInicial);
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
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2F6BFF] font-semibold text-white ${sizeClass}`}
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