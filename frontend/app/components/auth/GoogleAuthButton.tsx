"use client";

import { useEffect, useState } from "react";

interface GoogleAuthButtonProps {
  label: string;
  onSuccess: (profile: { name: string; email: string; picture?: string }) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M23.6 12.27c0-.78-.07-1.53-.21-2.26H12v4.28h6.43c-.28 1.46-1.1 2.7-2.34 3.54v2.95h3.78c2.2-2.03 3.47-5.03 3.47-8.51z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.06 7.95-2.89l-3.78-2.95c-1.05.7-2.4 1.12-4.17 1.12-3.2 0-5.92-2.16-6.89-5.08H1.3v3.18C3.26 20.74 7.34 24 12 24z" />
      <path fill="#FBBC05" d="M5.11 14.2c-.24-.7-.38-1.45-.38-2.2s.14-1.5.38-2.2V6.62H1.3A11.99 11.99 0 0 0 0 12c0 1.95.47 3.79 1.3 5.38l3.81-3.18z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.45-3.45C17.96 1.09 15.24 0 12 0 7.34 0 3.26 3.26 1.3 6.62l3.81 3.18C6.08 6.93 8.8 4.77 12 4.77z" />
      <path fill="none" d="M0 0h24v24H0z" />
    </svg>
  );
}

function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function GoogleAuthButton({ label, onSuccess }: GoogleAuthButtonProps) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      return;
    }

    if (window.google && window.google.accounts?.id) {
      setIsReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setIsReady(true);
    script.onerror = () => setError("No se pudo cargar Google Sign-In.");
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [clientId]);

  const handleGoogleSignIn = () => {
    if (!clientId) {
      const email = window.prompt("Ingresa tu correo de Google para iniciar sesión:");
      if (!email) return;
      onSuccess({ name: email.split("@")[0], email });
      return;
    }

    if (!window.google || !window.google.accounts?.id) {
      setError("Google Auth aún no está listo. Intenta de nuevo en unos segundos.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        if (!response?.credential) {
          setError("No se pudo autenticar con Google.");
          return;
        }

        const payload = decodeJwt(response.credential);
        if (!payload?.email) {
          setError("Hubo un error al leer la respuesta de Google.");
          return;
        }

        onSuccess({
          name: payload.name || payload.email.split("@")[0],
          email: payload.email,
          picture: payload.picture,
        });
      },
    });

    window.google.accounts.id.prompt();
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="flex w-full items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <GoogleIcon className="h-5 w-5" />
        {label}
      </button>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
