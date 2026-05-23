import type { ReactNode } from "react";
import VeterinarioLayoutShell from "./VeterinarioLayoutShell";

export default function VeterinarioLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <VeterinarioLayoutShell>{children}</VeterinarioLayoutShell>;
}
