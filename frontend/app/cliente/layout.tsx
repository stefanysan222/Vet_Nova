import type { ReactNode } from "react";
import ClientLayoutShell from "./ClientLayoutShell";

export default function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ClientLayoutShell>{children}</ClientLayoutShell>;
}