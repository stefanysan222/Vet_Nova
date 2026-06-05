"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "../../lib/auth";

type NombreClienteProps = {
  soloNombre?: boolean;
};

export default function NombreCliente({ soloNombre = false }: NombreClienteProps) {
  const [fullName, setFullName] = useState("Cliente");

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.name) setFullName(user.name);
  }, []);

  const firstName = fullName.split(" ")[0];
  return <>{soloNombre ? firstName : fullName}</>;
}
