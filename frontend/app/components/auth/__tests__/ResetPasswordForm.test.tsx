import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ResetPasswordForm from "../ResetPasswordForm";

const mockPush = vi.fn();
const mockGet = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet }),
}));

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

function mockFetch(status: number, body: unknown = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  mockGet.mockReturnValue("valid-reset-token");
});

describe("ResetPasswordForm", () => {
  it("muestra mensaje de enlace inválido cuando no hay token en la URL", () => {
    mockGet.mockReturnValue(null);
    render(<ResetPasswordForm />);
    expect(
      screen.getByText("El enlace de recuperación no es válido o ha expirado."),
    ).toBeInTheDocument();
  });

  it("muestra errores de validación con campos vacíos", async () => {
    render(<ResetPasswordForm />);
    fireEvent.click(screen.getByRole("button", { name: /restablecer contraseña/i }));
    await waitFor(() => {
      expect(screen.getByText("La contraseña es obligatoria.")).toBeInTheDocument();
      expect(screen.getByText("Confirma tu contraseña.")).toBeInTheDocument();
    });
  });

  it("muestra error de contraseña menor a 8 caracteres", async () => {
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), {
      target: { value: "corta" },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: "corta" },
    });
    fireEvent.click(screen.getByRole("button", { name: /restablecer contraseña/i }));
    await waitFor(() => {
      expect(screen.getByText("Mínimo 8 caracteres.")).toBeInTheDocument();
    });
  });

  it("muestra error cuando las contraseñas no coinciden", async () => {
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: "distinta456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /restablecer contraseña/i }));
    await waitFor(() => {
      expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
    });
  });

  it("muestra error cuando el token ha expirado", async () => {
    mockFetch(401, { message: "El enlace de recuperación es inválido o ha expirado." });
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), {
      target: { value: "nuevapassword123" },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: "nuevapassword123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /restablecer contraseña/i }));
    await waitFor(() => {
      expect(
        screen.getByText("El enlace de recuperación es inválido o ha expirado."),
      ).toBeInTheDocument();
    });
  });

  it("muestra pantalla de éxito tras restablecer la contraseña correctamente", async () => {
    mockFetch(200, { message: "Contraseña actualizada correctamente." });
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), {
      target: { value: "nuevapassword123" },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: "nuevapassword123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /restablecer contraseña/i }));
    await waitFor(() => {
      expect(screen.getByText("Contraseña restablecida")).toBeInTheDocument();
    });
  });
});
