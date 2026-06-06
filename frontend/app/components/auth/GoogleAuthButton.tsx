"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface GoogleAuthButtonProps {
  onSuccess: (data: { credential: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: object) => void;
        };
      };
    };
  }
}

export default function GoogleAuthButton({ onSuccess }: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSuccessRef = useRef(onSuccess);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  const handleCredential = useCallback((response: { credential?: string }) => {
    if (!response?.credential) {
      setError("No se pudo autenticar con Google.");
      return;
    }
    onSuccessRef.current({ credential: response.credential });
  }, []);

  useEffect(() => {
    if (!clientId || !containerRef.current) return;

    const init = () => {
      if (!window.google?.accounts?.id || !containerRef.current) return;

      const width = containerRef.current.offsetWidth || 400;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
      });

      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        width,
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
      });

      setReady(true);
    };

    if (window.google?.accounts?.id) {
      init();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", init);
      return () => existing.removeEventListener("load", init);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = init;
    script.onerror = () => setError("No se pudo cargar Google Sign-In.");
    document.head.appendChild(script);
  }, [clientId, handleCredential]);

  if (!clientId) return null;

  return (
    <div className="space-y-1.5">
      {!ready && (
        <div className="h-10 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      )}
      <div ref={containerRef} className={ready ? "w-full" : "invisible h-0 overflow-hidden"} />
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
