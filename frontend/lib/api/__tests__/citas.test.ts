import { vi, describe, it, expect, beforeEach } from "vitest";
import type { Appointment } from "../../recepcionista/types";
import type { CitaAPI } from "../citas";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock("../client", () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const CITA_API_BASE: CitaAPI = {
  id_cita: 10,
  fecha: "2024-03-15T00:00:00.000Z",
  hora: "09:30",
  estado: "Confirmada",
  servicio: "Vacunación",
  notas: "Traer carnet",
  veterinario: "Dra. Pérez",
  id_mascota: 5,
  id_usuario: 3,
  mascotas: {
    id_mascota: 5,
    nombre: "Firulais",
    especie: "Perro",
    raza: "Labrador",
    propietario: { id_propietario: 7, nombre: "Lorena Romero" },
  },
};

const APPOINTMENT_BASE: Omit<Appointment, "id"> = {
  date: "2024-03-15",
  time: "09:30",
  petId: "5",
  ownerId: "7",
  petName: "Firulais",
  ownerName: "Lorena Romero",
  service: "Vacunación",
  status: "Confirmada",
  veterinarian: "Dra. Pérez",
  notes: "Traer carnet",
  petEspecie: "Perro",
  petRaza: "Labrador",
};

describe("mapCitaToAppointment (a través de fetchCitas)", () => {
  it("mapea los campos del API al modelo Appointment, incluyendo estado normalizado", async () => {
    mockGet.mockResolvedValue({ data: [CITA_API_BASE], total: 1, page: 1, lastPage: 1 });
    const { fetchCitas } = await import("../citas");

    const [appointment] = await fetchCitas();

    expect(appointment).toEqual({
      id: "10",
      date: "2024-03-15",
      time: "09:30",
      petId: "5",
      ownerId: "7",
      petName: "Firulais",
      ownerName: "Lorena Romero",
      service: "Vacunación",
      status: "Confirmada",
      veterinarian: "Dra. Pérez",
      notes: "Traer carnet",
      petEspecie: "Perro",
      petRaza: "Labrador",
    });
  });

  it("usa 'Pendiente' como estado por defecto cuando el estado es desconocido o nulo", async () => {
    mockGet.mockResolvedValue({
      data: [{ ...CITA_API_BASE, estado: "estado-inexistente" }],
      total: 1,
      page: 1,
      lastPage: 1,
    });
    const { fetchCitas } = await import("../citas");

    const [appointment] = await fetchCitas();
    expect(appointment.status).toBe("Pendiente");
  });

  it("rellena valores vacíos cuando faltan datos de mascota/propietario", async () => {
    mockGet.mockResolvedValue({
      data: [
        {
          ...CITA_API_BASE,
          fecha: null,
          hora: null,
          servicio: null,
          notas: null,
          veterinario: null,
          id_mascota: null,
          mascotas: null,
        },
      ],
      total: 1,
      page: 1,
      lastPage: 1,
    });
    const { fetchCitas } = await import("../citas");

    const [appointment] = await fetchCitas();
    expect(appointment).toMatchObject({
      date: "",
      time: "",
      petId: "",
      ownerId: "",
      petName: "",
      ownerName: "",
      service: "",
      veterinarian: undefined,
      notes: undefined,
      petEspecie: undefined,
      petRaza: undefined,
    });
  });
});

describe("fetchCitas", () => {
  it("envía page y limit por defecto, y agrega id_usuario solo si se provee", async () => {
    mockGet.mockResolvedValue({ data: [], total: 0, page: 1, lastPage: 1 });
    const { fetchCitas } = await import("../citas");

    await fetchCitas();
    expect(mockGet).toHaveBeenCalledWith("/citas?page=1&limit=100");

    mockGet.mockClear();
    await fetchCitas(42, 2, 20);
    expect(mockGet).toHaveBeenCalledWith("/citas?page=2&limit=20&id_usuario=42");
  });
});

describe("createCita", () => {
  it("convierte la fecha a ISO-8601 y traduce el estado al formato del backend", async () => {
    mockPost.mockResolvedValue(CITA_API_BASE);
    const { createCita } = await import("../citas");

    await createCita(APPOINTMENT_BASE, 3);

    expect(mockPost).toHaveBeenCalledWith("/citas", {
      fecha: new Date("2024-03-15T00:00:00.000Z").toISOString(),
      hora: "09:30",
      estado: "confirmada",
      servicio: "Vacunación",
      notas: "Traer carnet",
      veterinario: "Dra. Pérez",
      id_mascota: 5,
      id_usuario: 3,
    });
  });

  it("envía campos opcionales como undefined cuando vienen vacíos", async () => {
    mockPost.mockResolvedValue(CITA_API_BASE);
    const { createCita } = await import("../citas");

    await createCita({ ...APPOINTMENT_BASE, date: "", service: "", notes: "", veterinarian: "" });

    expect(mockPost).toHaveBeenCalledWith(
      "/citas",
      expect.objectContaining({
        fecha: undefined,
        servicio: undefined,
        notas: undefined,
        veterinario: undefined,
        id_usuario: undefined,
      }),
    );
  });
});

describe("updateCitaEstado", () => {
  it("traduce el nuevo estado al formato del backend y devuelve la cita mapeada", async () => {
    mockPut.mockResolvedValue({ ...CITA_API_BASE, estado: "cancelada" });
    const { updateCitaEstado } = await import("../citas");

    const result = await updateCitaEstado("10", "Cancelada");

    expect(mockPut).toHaveBeenCalledWith("/citas/10", { estado: "cancelada" });
    expect(result.status).toBe("Cancelada");
  });
});

describe("updateCita", () => {
  it("envía fecha, hora, estado y datos editables, sin enviar campos de mascota/propietario", async () => {
    mockPut.mockResolvedValue(CITA_API_BASE);
    const { updateCita } = await import("../citas");

    await updateCita({ ...APPOINTMENT_BASE, id: "10", status: "Reprogramada" });

    expect(mockPut).toHaveBeenCalledWith("/citas/10", {
      fecha: new Date("2024-03-15T00:00:00.000Z").toISOString(),
      hora: "09:30",
      estado: "reprogramada",
      servicio: "Vacunación",
      notas: "Traer carnet",
      veterinario: "Dra. Pérez",
    });
  });
});

describe("deleteCita", () => {
  it("llama a DELETE /citas/:id", async () => {
    mockDelete.mockResolvedValue(undefined);
    const { deleteCita } = await import("../citas");

    await deleteCita("10");
    expect(mockDelete).toHaveBeenCalledWith("/citas/10");
  });
});
