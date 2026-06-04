import type { ReactNode } from "react";
import { RecepcionistaLayoutShell } from "./RecepcionistaLayoutShell";

export default function RecepcionistaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RecepcionistaLayoutShell>{children}</RecepcionistaLayoutShell>;
}