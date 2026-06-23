import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import LoginForm from "../LoginForm";

const mockPush = vi.fn();
const mockLoginUser = vi.fn();
const mockLoginOrRegisterGoogle = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("../GoogleAuthButton", () => ({
  default: ({ onSuccess }: { onSuccess: (data: { credential: string }) => void }) => (
    <button type="button" onClick={() => onSuccess({ credential: "fake-credential" })}>
      Google
    </button>
  ),
}));

const mockResendVerification = vi.fn();

vi.mock("../../../../lib/auth", () => ({
  loginUser: (...args: unknown[]) => mockLoginUser(...args),
  loginOrRegisterGoogle: (...args: unknown[]) => mockLoginOrRegisterGoogle(...args),
  resendVerification: (...args: unknown[]) => mockResendVerification(...args),
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ user: null, loading: false, refresh: mockRefresh }),
}));

vi.mock("../../ui/Toast", () => ({
  useToast: () => ({ info: vi.fn() }),
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LoginForm", () => {
  it("muestra errores de validación con el formulario vacío", async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(screen.getByText("El correo es obligatorio.")).toBeInTheDocument();
      expect(screen.getByText("La contraseña es obligatoria.")).toBeInTheDocument();
    });
  });

  it("muestra error con email con formato inválido", async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "no-es-un-email" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "12345678" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(screen.getByText("Ingresa un correo válido.")).toBeInTheDocument();
    });
  });

  it("muestra error cuando las credenciales son incorrectas", async () => {
    mockLoginUser.mockResolvedValue({ error: "Credenciales incorrectas." });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "12345678" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(screen.getByText("Credenciales incorrectas.")).toBeInTheDocument();
    });
  });

  it("muestra mensaje de rate limit en error 429", async () => {
    mockLoginUser.mockResolvedValue({
      error: "Demasiados intentos. Intenta de nuevo en unos minutos.",
    });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "12345678" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(
        screen.getByText("Demasiados intentos. Intenta de nuevo en unos minutos."),
      ).toBeInTheDocument();
    });
  });

  it("redirige a /admin tras login exitoso con rol Administrador", async () => {
    mockLoginUser.mockResolvedValue({
      user: { id: 1, name: "Admin", email: "admin@test.com", role: "Administrador" },
    });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "12345678" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/admin");
    });
  });

  it("redirige a /veterinario tras login exitoso con rol Veterinario", async () => {
    mockLoginUser.mockResolvedValue({
      user: { id: 2, name: "Vet", email: "vet@test.com", role: "Veterinario" },
    });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "vet@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "12345678" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/veterinario");
    });
  });

  it("llama loginOrRegisterGoogle y redirige tras autenticación con Google", async () => {
    mockLoginOrRegisterGoogle.mockResolvedValue({
      user: { id: 3, name: "Cliente", email: "cliente@gmail.com", role: "Cliente" },
    });
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /google/i }));
    await waitFor(() => {
      expect(mockLoginOrRegisterGoogle).toHaveBeenCalledWith({ credential: "fake-credential" });
      expect(mockPush).toHaveBeenCalledWith("/cliente");
    });
  });
});
