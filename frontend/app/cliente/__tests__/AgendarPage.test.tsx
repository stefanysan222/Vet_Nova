import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { Appointment } from "../../../lib/recepcionista/types";
import AgendarPage from "../agendar/page";

const mockUseAuth = vi.fn();
const mockFetchCitas = vi.fn();
const mockUpdateCitaEstado = vi.fn();
const mockGetSearchParam = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: (key: string) => mockGetSearchParam(key) }),
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../../../lib/api/citas", () => ({
  fetchCitas: (...args: unknown[]) => mockFetchCitas(...args),
  updateCitaEstado: (...args: unknown[]) => mockUpdateCitaEstado(...args),
}));

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: "1",
    date: "2026-07-01",
    time: "10:00",
    petId: "p1",
    ownerId: "o1",
    petName: "Firulais",
    ownerName: "Lorena Romero",
    service: "Consulta general",
    status: "Confirmada",
    veterinarian: "Dr. Pérez",
    notes: "Revisión anual",
    petEspecie: "Perro",
    petRaza: "Labrador",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: { id: "13", name: "Lorena Romero", role: "Cliente" } });
  mockGetSearchParam.mockReturnValue(null);
  mockFetchCitas.mockResolvedValue([]);
});

describe("AgendarPage — carga de citas", () => {
  it("muestra el estado de carga antes de recibir datos", () => {
    render(<AgendarPage />);
    expect(screen.getByText(/cargando citas/i)).toBeInTheDocument();
  });

  it("muestra las citas obtenidas de la API tras cargar", async () => {
    mockFetchCitas.mockResolvedValue([makeAppointment()]);
    render(<AgendarPage />);

    await waitFor(() => {
      expect(screen.getByText("Firulais")).toBeInTheDocument();
    });
  });

  it("si la API falla, no muestra citas y no rompe la página", async () => {
    mockFetchCitas.mockRejectedValue(new Error("network error"));
    render(<AgendarPage />);

    await waitFor(() => {
      expect(screen.getByText(/no se encontraron citas/i)).toBeInTheDocument();
    });
  });

  it("muestra el banner de éxito cuando el query param 'solicitud=enviada' está presente", async () => {
    mockGetSearchParam.mockImplementation((key: string) =>
      key === "solicitud" ? "enviada" : null,
    );
    render(<AgendarPage />);

    await waitFor(() => {
      expect(screen.getByText(/solicitud enviada correctamente/i)).toBeInTheDocument();
    });
  });
});

describe("AgendarPage — filtros y búsqueda", () => {
  beforeEach(() => {
    mockFetchCitas.mockResolvedValue([
      makeAppointment({ id: "1", petName: "Firulais", status: "Confirmada" }),
      makeAppointment({ id: "2", petName: "Michi", status: "Pendiente" }),
      makeAppointment({ id: "3", petName: "Rex", status: "Cancelada" }),
    ]);
  });

  it("el filtro 'Confirmadas' muestra solo citas confirmadas", async () => {
    render(<AgendarPage />);
    await waitFor(() => expect(screen.getByText("Firulais")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Confirmadas" }));

    expect(screen.getByText("Firulais")).toBeInTheDocument();
    expect(screen.queryByText("Michi")).not.toBeInTheDocument();
    expect(screen.queryByText("Rex")).not.toBeInTheDocument();
  });

  it("el filtro 'Canceladas' muestra solo citas canceladas", async () => {
    render(<AgendarPage />);
    await waitFor(() => expect(screen.getByText("Firulais")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Canceladas" }));

    expect(screen.getByText("Rex")).toBeInTheDocument();
    expect(screen.queryByText("Firulais")).not.toBeInTheDocument();
  });

  it("la búsqueda filtra por nombre de mascota", async () => {
    render(<AgendarPage />);
    await waitFor(() => expect(screen.getByText("Firulais")).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText(/buscar por mascota/i);
    fireEvent.change(searchInput, { target: { value: "michi" } });

    expect(screen.getByText("Michi")).toBeInTheDocument();
    expect(screen.queryByText("Firulais")).not.toBeInTheDocument();
  });

  it("sin resultados muestra el estado vacío con botón para limpiar filtros", async () => {
    render(<AgendarPage />);
    await waitFor(() => expect(screen.getByText("Firulais")).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText(/buscar por mascota/i);
    fireEvent.change(searchInput, { target: { value: "zzz_no_existe" } });

    expect(screen.getByText(/no se encontraron citas/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /limpiar filtros/i }));
    expect(screen.getByText("Firulais")).toBeInTheDocument();
  });
});

describe("AgendarPage — cancelar cita", () => {
  it("cancela la cita vía API y recarga el listado", async () => {
    mockFetchCitas
      .mockResolvedValueOnce([makeAppointment({ id: "1", status: "Confirmada" })])
      .mockResolvedValueOnce([makeAppointment({ id: "1", status: "Cancelada" })]);
    mockUpdateCitaEstado.mockResolvedValue({});

    render(<AgendarPage />);
    await waitFor(() => expect(screen.getByText("Firulais")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /cancelar cita/i }));

    await waitFor(() => {
      expect(mockUpdateCitaEstado).toHaveBeenCalledWith("1", "Cancelada");
    });
    expect(mockFetchCitas).toHaveBeenCalledTimes(2);
  });

  it("abre el modal de detalle con la información de la cita", async () => {
    mockFetchCitas.mockResolvedValue([makeAppointment({ notes: "Vacuna antirrábica" })]);
    render(<AgendarPage />);
    await waitFor(() => expect(screen.getByText("Firulais")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /ver detalle/i }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Vacuna antirrábica")).toBeInTheDocument();
  });
});
