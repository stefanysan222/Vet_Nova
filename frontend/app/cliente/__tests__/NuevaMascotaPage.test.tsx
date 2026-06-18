import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import NuevaMascotaPage from "../mascotas/nueva/page";

const mockPush = vi.fn();
const mockUseAuth = vi.fn();
const mockUseClienteProfile = vi.fn();
const mockFetchPropietarioByUsuario = vi.fn();
const mockCreateMascota = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../ClienteProfileContext", () => ({
  useClienteProfile: () => mockUseClienteProfile(),
}));

vi.mock("../../../lib/api/propietarios", () => ({
  fetchPropietarioByUsuario: (...args: unknown[]) => mockFetchPropietarioByUsuario(...args),
}));

vi.mock("../../../lib/api/mascotas", () => ({
  createMascota: (...args: unknown[]) => mockCreateMascota(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: { id: 13, name: "Lorena Romero", role: "Cliente" } });
  mockUseClienteProfile.mockReturnValue({
    perfil: { nombre: "Lorena", apellido: "Romero", email: "lorena@test.com", telefono: "" },
  });
  mockFetchPropietarioByUsuario.mockResolvedValue({ id: "5", phone: "" });
  mockCreateMascota.mockResolvedValue({});
});

describe("NuevaMascotaPage", () => {
  it("no muestra la opción de subir antecedentes/historia clínica", () => {
    render(<NuevaMascotaPage />);

    expect(screen.queryByText(/antecedentes clínicos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/historia clínica/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/subir documento/i)).not.toBeInTheDocument();
  });

  it("guarda la mascota sin enviar documentos clínicos", async () => {
    render(<NuevaMascotaPage />);

    fireEvent.change(screen.getByLabelText(/^nombre/i), { target: { value: "Firulais" } });
    fireEvent.change(screen.getByLabelText(/^raza/i), { target: { value: "Labrador" } });

    fireEvent.click(screen.getByRole("button", { name: /guardar mascota/i }));

    await waitFor(() => {
      expect(mockCreateMascota).toHaveBeenCalledTimes(1);
    });

    const payload = mockCreateMascota.mock.calls[0][0];
    expect(payload).not.toHaveProperty("documentos");
    expect(payload).not.toHaveProperty("documentosClinicos");
    expect(payload).not.toHaveProperty("antecedentes");
    expect(mockPush).toHaveBeenCalledWith("/cliente/mascotas");
  });
});
