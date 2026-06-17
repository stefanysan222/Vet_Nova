import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { PetRecord, Appointment } from "../../../lib/recepcionista/types";
import type { UsuarioAPI } from "../../../lib/api/usuarios";
import NuevaCitaPage from "../agendar/nueva/page";

const mockPush = vi.fn();
const mockUseAuth = vi.fn();
const mockFetchMascotas = vi.fn();
const mockFetchPropietarioByUsuario = vi.fn();
const mockFetchCitas = vi.fn();
const mockFetchVeterinarios = vi.fn();
const mockCreateCita = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../../../lib/api/mascotas", () => ({
  fetchMascotas: (...args: unknown[]) => mockFetchMascotas(...args),
}));

vi.mock("../../../lib/api/propietarios", () => ({
  fetchPropietarioByUsuario: (...args: unknown[]) => mockFetchPropietarioByUsuario(...args),
}));

vi.mock("../../../lib/api/citas", () => ({
  fetchCitas: (...args: unknown[]) => mockFetchCitas(...args),
  createCita: (...args: unknown[]) => mockCreateCita(...args),
}));

vi.mock("../../../lib/api/usuarios", () => ({
  fetchVeterinarios: (...args: unknown[]) => mockFetchVeterinarios(...args),
}));

function makeMascota(overrides: Partial<PetRecord> = {}): PetRecord {
  return {
    id: "m1",
    nombre: "Firulais",
    especie: "Perro",
    raza: "Labrador",
    edad: "3 años",
    peso: "20kg",
    sexo: "Macho",
    propietarioId: "5",
    propietarioNombre: "Lorena Romero",
    ...overrides,
  };
}

function makeVet(overrides: Partial<UsuarioAPI> = {}): UsuarioAPI {
  return { id: 1, nombre: "Dr. Pérez", rol: "Veterinario", ...overrides };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: { id: "13", name: "Lorena Romero", role: "Cliente" } });
  mockFetchPropietarioByUsuario.mockResolvedValue({ id: "5" });
  mockFetchMascotas.mockResolvedValue([makeMascota()]);
  mockFetchCitas.mockResolvedValue([] as Appointment[]);
  mockFetchVeterinarios.mockResolvedValue([makeVet()]);
  mockCreateCita.mockResolvedValue({});
});

async function avanzarHastaPaso3() {
  await waitFor(() => expect(screen.getByText("Firulais")).toBeInTheDocument());
  fireEvent.click(screen.getByText("Firulais"));
  fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));
  fireEvent.click(screen.getByText("Consulta general"));
  fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));
}

describe("NuevaCitaPage — paso 1: mascota", () => {
  it("preselecciona automáticamente la única mascota del usuario", async () => {
    render(<NuevaCitaPage />);
    await waitFor(() => expect(screen.getByText("Firulais")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));
    expect(screen.getByText(/¿qué necesita firulais\?/i)).toBeInTheDocument();
  });

  it("no permite avanzar sin seleccionar mascota cuando hay varias", async () => {
    mockFetchMascotas.mockResolvedValue([
      makeMascota({ id: "m1", nombre: "Firulais" }),
      makeMascota({ id: "m2", nombre: "Michi" }),
    ]);
    render(<NuevaCitaPage />);
    await waitFor(() => expect(screen.getByText("Firulais")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    expect(screen.getByText(/selecciona una mascota/i)).toBeInTheDocument();
    expect(screen.queryByText(/¿qué necesita/i)).not.toBeInTheDocument();
  });

  it("muestra mensaje cuando el usuario no tiene mascotas registradas", async () => {
    mockFetchMascotas.mockResolvedValue([]);
    render(<NuevaCitaPage />);
    await waitFor(() => {
      expect(screen.getByText(/no tienes mascotas registradas/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /siguiente/i })).toBeDisabled();
  });
});

describe("NuevaCitaPage — paso 2: servicio", () => {
  it("no permite avanzar sin seleccionar un servicio", async () => {
    render(<NuevaCitaPage />);
    await waitFor(() => expect(screen.getByText("Firulais")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Firulais"));
    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    expect(screen.getByText(/selecciona un servicio/i)).toBeInTheDocument();
  });

  it("botón Atrás regresa al paso 1", async () => {
    render(<NuevaCitaPage />);
    await waitFor(() => expect(screen.getByText("Firulais")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Firulais"));
    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    fireEvent.click(screen.getByRole("button", { name: /atrás/i }));

    expect(screen.getByText(/¿para qué mascota es la cita\?/i)).toBeInTheDocument();
  });
});

describe("NuevaCitaPage — paso 3: fecha, hora y envío", () => {
  it("domingo muestra aviso de clínica cerrada y bloquea el envío", async () => {
    render(<NuevaCitaPage />);
    await avanzarHastaPaso3();

    const today = new Date();
    const daysUntilSunday = (7 - today.getDay()) % 7 || 7;
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + daysUntilSunday);
    const sundayStr = sunday.toISOString().slice(0, 10);

    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: sundayStr } });

    expect(screen.getByText(/la clínica está cerrada este día/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /solicitar cita/i }));
    await waitFor(() => {
      expect(screen.getByText(/la clínica no atiende ese día/i)).toBeInTheDocument();
    });
    expect(mockCreateCita).not.toHaveBeenCalled();
  });

  it("envía la cita con los datos seleccionados y redirige con éxito", async () => {
    render(<NuevaCitaPage />);
    await avanzarHastaPaso3();

    const today = new Date();
    const weekday = today.getDay();
    const offset = weekday === 6 ? 2 : weekday === 0 ? 1 : 1;
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + offset);
    const dateStr = nextDay.toISOString().slice(0, 10);

    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: dateStr } });

    await waitFor(() => expect(screen.getByText(/horario:/i)).toBeInTheDocument());

    const slotButtons = screen
      .getAllByRole("button")
      .filter((b) => /am|pm/i.test(b.textContent ?? ""));
    expect(slotButtons.length).toBeGreaterThan(0);
    fireEvent.click(slotButtons[0]);

    await waitFor(() => expect(screen.getByText("Dr. Pérez")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Dr. Pérez"));

    fireEvent.click(screen.getByRole("button", { name: /solicitar cita/i }));

    await waitFor(() => {
      expect(mockCreateCita).toHaveBeenCalledWith(
        expect.objectContaining({
          petId: "m1",
          service: "Consulta general",
          status: "Pendiente",
          veterinarian: "Dr. Pérez",
          veterinarianId: 1,
        }),
      );
    });
    expect(mockPush).toHaveBeenCalledWith("/cliente/agendar?solicitud=enviada");
  });

  it("muestra el error real del backend si createCita falla", async () => {
    mockCreateCita.mockRejectedValue(new Error("No hay turnos disponibles para esa fecha."));
    render(<NuevaCitaPage />);
    await avanzarHastaPaso3();

    const today = new Date();
    const weekday = today.getDay();
    const offset = weekday === 6 ? 2 : weekday === 0 ? 1 : 1;
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + offset);
    const dateStr = nextDay.toISOString().slice(0, 10);
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: dateStr } });

    await waitFor(() => expect(screen.getByText(/horario:/i)).toBeInTheDocument());
    const slotButtons = screen
      .getAllByRole("button")
      .filter((b) => /am|pm/i.test(b.textContent ?? ""));
    fireEvent.click(slotButtons[0]);

    fireEvent.click(screen.getByRole("button", { name: /solicitar cita/i }));

    await waitFor(() => {
      expect(screen.getByText("No hay turnos disponibles para esa fecha.")).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
