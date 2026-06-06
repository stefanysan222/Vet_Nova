import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { ToastProvider } from "./components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vet Nova | Clínica Veterinaria",
  description:
    "Página principal de Vet Nova, clínica veterinaria con servicios de urgencias, vacunación y estética para mascotas.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Activar renderizado dinámico para que Next.js inyecte el nonce CSP en sus scripts internos
  await headers();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
