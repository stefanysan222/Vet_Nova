"use client";

import { useAuth } from "@/lib/auth-context";

type NombreClienteProps = {
  soloNombre?: boolean;
};

export default function NombreCliente({ soloNombre = false }: NombreClienteProps) {
  const { user } = useAuth();
  const fullName = user?.name ?? "Cliente";
  const firstName = fullName.split(" ")[0];
  return <>{soloNombre ? firstName : fullName}</>;
}
