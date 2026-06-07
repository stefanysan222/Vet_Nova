import type { ReactNode } from "react";
import ClientLayoutShell from "./ClientLayoutShell";
import { ClienteProfileProvider } from "./ClienteProfileContext";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ClienteProfileProvider>
      <ClientLayoutShell>{children}</ClientLayoutShell>
    </ClienteProfileProvider>
  );
}
