"use client";

import { useEffect, useState } from "react";

const PROFILE_STORAGE_KEY = "vetnova_cliente_perfil";

type PerfilCliente = {
  nombre?: string;
  apellido?: string;
};

type NombreClienteProps = {
  soloNombre?: boolean;
};

export default function NombreCliente({
  soloNombre = false,
}: NombreClienteProps) {
  const [nombre, setNombre] = useState("Juan");
  const [apellido, setApellido] = useState("Pérez");

  useEffect(() => {
    const cargarPerfil = () => {
      const informacionGuardada = localStorage.getItem(PROFILE_STORAGE_KEY);

      if (!informacionGuardada) return;

      try {
        const perfil = JSON.parse(informacionGuardada) as PerfilCliente;

        setNombre(perfil.nombre?.trim() || "Juan");
        setApellido(perfil.apellido?.trim() || "Pérez");
      } catch {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
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

  return (
    <>
      {soloNombre ? nombre : `${nombre} ${apellido}`}
    </>
  );
}