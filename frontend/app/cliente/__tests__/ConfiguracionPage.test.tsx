import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ConfiguracionPage from "../configuracion/page";

const mockUseAuth = vi.fn();
const mockUseClienteProfile = vi.fn();
const mockUpdateUsuario = vi.fn();
const mockFetchPropietarioByUsuario = vi.fn();
const mockUpdatePropietario = vi.fn();
const mockApiPut = vi.fn();

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../ClienteProfileContext", () => ({
  useClienteProfile: () => mockUseClienteProfile(),
}));

vi.mock("@/lib/api/usuarios", () => ({
  updateUsuario: (...args: unknown[]) => mockUpdateUsuario(...args),
}));

vi.mock("@/lib/api/propietarios", () => ({
  fetchPropietarioByUsuario: (...args: unknown[]) => mockFetchPropietarioByUsuario(...args),
  updatePropietario: (...args: unknown[]) => mockUpdatePropietario(...args),
}));

vi.mock("@/lib/api/client", () => ({
  api: { put: (...args: unknown[]) => mockApiPut(...args) },
}));

const PERFIL_BASE = {
  nombre: "Lorena",
  apellido: "Romero",
  email: "lorena@test.com",
  telefono: "3001234567",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: { id: "13", name: "Lorena Romero", role: "Cliente" } });
  mockUseClienteProfile.mockReturnValue({
    perfil: PERFIL_BASE,
    refrescar: vi.fn().mockResolvedValue(undefined),
  });
  mockFetchPropietarioByUsuario.mockResolvedValue(null);
});

const ERROR_BANNER_CLASS = "border-red-200";
const SUCCESS_BANNER_CLASS = "border-emerald-200";

describe("ConfiguracionPage — información personal", () => {
  it("muestra el mensaje de éxito en verde cuando el guardado funciona", async () => {
    mockUpdateUsuario.mockResolvedValue({});
    render(<ConfiguracionPage />);

    fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => {
      const banner = screen.getByText("Tu información personal fue actualizada correctamente.");
      expect(banner.className).toContain(SUCCESS_BANNER_CLASS);
      expect(banner.className).not.toContain(ERROR_BANNER_CLASS);
    });
  });

  it("muestra el mensaje de error en rojo (no verde) cuando falla el guardado", async () => {
    mockUpdateUsuario.mockRejectedValue(new Error("No tienes permiso para realizar esta acción."));
    render(<ConfiguracionPage />);

    fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => {
      const banner = screen.getByText("No tienes permiso para realizar esta acción.");
      expect(banner.className).toContain(ERROR_BANNER_CLASS);
      expect(banner.className).not.toContain(SUCCESS_BANNER_CLASS);
    });
  });

  it("propaga el mensaje real del backend en lugar de un texto genérico", async () => {
    mockUpdateUsuario.mockRejectedValue(new Error("El correo ya está en uso."));
    render(<ConfiguracionPage />);

    fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(screen.getByText("El correo ya está en uso.")).toBeInTheDocument();
      expect(
        screen.queryByText(
          "No se pudo guardar tu información personal. Intenta de nuevo más tarde.",
        ),
      ).not.toBeInTheDocument();
    });
  });

  it("limpia el mensaje de error al editar un campo", async () => {
    mockUpdateUsuario.mockRejectedValue(new Error("No tienes permiso para realizar esta acción."));
    render(<ConfiguracionPage />);

    fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));
    await waitFor(() => {
      expect(screen.getByText("No tienes permiso para realizar esta acción.")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/^nombre$/i), { target: { value: "Lorena Isabel" } });

    expect(
      screen.queryByText("No tienes permiso para realizar esta acción."),
    ).not.toBeInTheDocument();
  });
});

describe("ConfiguracionPage — cambio de contraseña", () => {
  function llenarFormularioPwd(actual: string, nueva: string, confirmacion: string) {
    fireEvent.change(screen.getByLabelText(/contraseña actual/i), { target: { value: actual } });
    fireEvent.change(screen.getByLabelText(/^nueva contraseña$/i), { target: { value: nueva } });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: confirmacion },
    });
  }

  it("valida longitud mínima antes de llamar a la API", async () => {
    render(<ConfiguracionPage />);
    llenarFormularioPwd("actual123", "corta", "corta");
    fireEvent.click(screen.getByRole("button", { name: /actualizar contraseña/i }));

    await waitFor(() => {
      expect(
        screen.getByText("La nueva contraseña debe tener al menos 8 caracteres."),
      ).toBeInTheDocument();
    });
    expect(mockApiPut).not.toHaveBeenCalled();
  });

  it("valida que las contraseñas coincidan antes de llamar a la API", async () => {
    render(<ConfiguracionPage />);
    llenarFormularioPwd("actual123", "nuevaclave1", "otraclave2");
    fireEvent.click(screen.getByRole("button", { name: /actualizar contraseña/i }));

    await waitFor(() => {
      expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
    });
    expect(mockApiPut).not.toHaveBeenCalled();
  });

  it("muestra el error real del backend (p. ej. permisos) en rojo cuando falla", async () => {
    mockApiPut.mockRejectedValue(new Error("No tienes permiso para realizar esta acción."));
    render(<ConfiguracionPage />);
    llenarFormularioPwd("actual123", "nuevaclave1", "nuevaclave1");
    fireEvent.click(screen.getByRole("button", { name: /actualizar contraseña/i }));

    await waitFor(() => {
      const banner = screen.getByText("No tienes permiso para realizar esta acción.");
      expect(banner.className).toContain(ERROR_BANNER_CLASS);
    });
    expect(mockApiPut).toHaveBeenCalledWith("/usuarios/13", {
      password: "nuevaclave1",
      currentPassword: "actual123",
    });
  });

  it("muestra mensaje de éxito y limpia el formulario cuando la API responde bien", async () => {
    mockApiPut.mockResolvedValue({});
    render(<ConfiguracionPage />);
    llenarFormularioPwd("actual123", "nuevaclave1", "nuevaclave1");
    fireEvent.click(screen.getByRole("button", { name: /actualizar contraseña/i }));

    await waitFor(() => {
      expect(screen.getByText("Contraseña actualizada correctamente.")).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/contraseña actual/i)).toHaveValue("");
  });
});
