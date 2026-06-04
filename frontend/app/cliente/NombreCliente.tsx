"use client";

import { getCurrentUser } from "../../lib/auth";

type NombreClienteProps = {
  soloNombre?: boolean;
};

export default function NombreCliente({ soloNombre = false }: NombreClienteProps) {
  const user = getCurrentUser();
  const fullName = user?.name ?? "Cliente";
  const firstName = fullName.split(" ")[0];

  return <>{soloNombre ? firstName : fullName}</>;
}
