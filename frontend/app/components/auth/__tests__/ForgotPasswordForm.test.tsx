import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ForgotPasswordForm from "../ForgotPasswordForm";

function mockFetch(status: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
    }),
  );
}

vi.mock("framer-motion", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  const el = (tag: string) => {
    const Component = ({
      children,
      animate: _animate,
      initial: _initial,
      transition: _transition,
      variants: _variants,
      whileHover: _whileHover,
      whileTap: _whileTap,
      ...p
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }: any) => React.createElement(tag, p, children);
    Component.displayName = `motion.${tag}`;
    return Component;
  };
  return {
    motion: {
      div: el("div"),
      button: el("button"),
      p: el("p"),
      span: el("span"),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("ForgotPasswordForm", () => {
  it("muestra error cuando el campo está vacío", async () => {
    render(<ForgotPasswordForm />);
    fireEvent.click(screen.getByRole("button", { name: /enviar enlace/i }));
    await waitFor(() => {
      expect(screen.getByText("El correo es obligatorio.")).toBeInTheDocument();
    });
  });

  it("muestra error con email con formato inválido", async () => {
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "no-es-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar enlace/i }));
    await waitFor(() => {
      expect(screen.getByText("Ingresa un correo válido.")).toBeInTheDocument();
    });
  });

  it("muestra mensaje de rate limit en error 429", async () => {
    mockFetch(429);
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "test@test.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar enlace/i }));
    await waitFor(() => {
      expect(
        screen.getByText("Demasiados intentos. Intenta de nuevo en unos minutos."),
      ).toBeInTheDocument();
    });
  });

  it("muestra error de servidor en respuesta 500", async () => {
    mockFetch(500);
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "test@test.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar enlace/i }));
    await waitFor(() => {
      expect(
        screen.getByText("No se pudo enviar el correo. Intenta de nuevo más tarde."),
      ).toBeInTheDocument();
    });
  });

  it("muestra pantalla de éxito tras respuesta 200", async () => {
    mockFetch(200);
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "test@test.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar enlace/i }));
    await waitFor(() => {
      expect(screen.getByText("Correo enviado")).toBeInTheDocument();
    });
  });

  it("muestra pantalla de éxito incluso con 404 (no revela si el email existe)", async () => {
    mockFetch(404);
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "noexiste@test.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar enlace/i }));
    await waitFor(() => {
      expect(screen.getByText("Correo enviado")).toBeInTheDocument();
    });
  });
});
