"use client";

import { useClienteProfile } from "./ClienteProfileContext";

type AvatarSize = "small" | "medium";

type AvatarClienteProps = {
  size?: AvatarSize;
};

export default function AvatarCliente({ size = "medium" }: AvatarClienteProps) {
  const { perfil } = useClienteProfile();

  const iniciales = `${perfil.nombre.charAt(0)}${perfil.apellido.charAt(0)}`;

  const sizeClass = size === "small" ? "h-9 w-9 text-[14px]" : "h-[48px] w-[48px] text-[17px]";

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-600 font-semibold text-white ${sizeClass}`}
    >
      {iniciales}
    </div>
  );
}
