import { vi, describe, it, expect, beforeEach } from "vitest";
import type { PetRecord } from "../../recepcionista/types";
import type { MascotaAPI } from "../mascotas";

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

const MASCOTA_BASE: MascotaAPI = {
  id_mascota: 5,
  nombre: "Firulais",
  especie: "Perro",
  raza: "Labrador",
  edad: 3,
  peso: 12.5,
  sexo: "Macho",
  fecha_nacimiento: "2021-01-01",
  foto: "https://img/firulais.png",
  id_propietario: 7,
  propietario: { id_propietario: 7, nombre: "Lorena Romero" },
};

describe("mapMascotaToPetRecord", () => {
  it("mapea los campos del API a PetRecord, formateando edad y peso", async () => {
    const { mapMascotaToPetRecord } = await import("../mascotas");

    expect(mapMascotaToPetRecord(MASCOTA_BASE)).toEqual({
      id: "5",
      nombre: "Firulais",
      especie: "Perro",
      raza: "Labrador",
      edad: "3 años",
      peso: "12.5 kg",
      sexo: "Macho",
      fechaNacimiento: "2021-01-01",
      foto: "https://img/firulais.png",
      propietarioId: "7",
      propietarioNombre: "Lorena Romero",
    });
  });

  it("rellena valores por defecto cuando los campos vienen nulos", async () => {
    const { mapMascotaToPetRecord } = await import("../mascotas");

    const result = mapMascotaToPetRecord({
      ...MASCOTA_BASE,
      nombre: null,
      especie: null,
      raza: null,
      edad: null,
      peso: null,
      sexo: null,
      fecha_nacimiento: null,
      foto: null,
      id_propietario: null,
      propietario: null,
    });

    expect(result).toMatchObject({
      nombre: "",
      especie: "",
      raza: "",
      edad: "",
      peso: "",
      sexo: "No especificado",
      fechaNacimiento: undefined,
      foto: "",
      propietarioId: "",
      propietarioNombre: "",
    });
  });
});

describe("mapPetRecordToMascota", () => {
  const PET: Omit<PetRecord, "id" | "propietarioNombre"> = {
    nombre: "Firulais",
    especie: "Perro",
    raza: "Labrador",
    edad: "3 años",
    peso: "12.5 kg",
    sexo: "Macho",
    fechaNacimiento: "2021-01-01",
    foto: "https://img/firulais.png",
    propietarioId: "7",
  };

  it("convierte edad y peso de texto a número, y arma el payload del API", async () => {
    const { mapPetRecordToMascota } = await import("../mascotas");

    expect(mapPetRecordToMascota(PET)).toEqual({
      nombre: "Firulais",
      especie: "Perro",
      raza: "Labrador",
      edad: 3,
      peso: 12.5,
      sexo: "Macho",
      fecha_nacimiento: "2021-01-01",
      foto: "https://img/firulais.png",
      id_propietario: 7,
    });
  });

  it("envía undefined para campos vacíos o sexo 'No especificado'", async () => {
    const { mapPetRecordToMascota } = await import("../mascotas");

    expect(
      mapPetRecordToMascota({
        ...PET,
        especie: "",
        raza: "",
        edad: "",
        peso: "",
        sexo: "No especificado",
        fechaNacimiento: "",
        foto: "",
        propietarioId: "",
      }),
    ).toEqual({
      nombre: "Firulais",
      especie: undefined,
      raza: undefined,
      edad: undefined,
      peso: undefined,
      sexo: undefined,
      fecha_nacimiento: undefined,
      foto: undefined,
      id_propietario: undefined,
    });
  });
});

describe("fetchMascotas", () => {
  it("envía page y limit por defecto, y agrega id_propietario solo si se provee", async () => {
    mockGet.mockResolvedValue({ data: [MASCOTA_BASE], total: 1, lastPage: 1 });
    const { fetchMascotas } = await import("../mascotas");

    await fetchMascotas();
    expect(mockGet).toHaveBeenCalledWith("/mascotas?page=1&limit=100");

    mockGet.mockClear();
    await fetchMascotas(7, 2, 20);
    expect(mockGet).toHaveBeenCalledWith("/mascotas?page=2&limit=20&id_propietario=7");
  });

  it("mapea la lista de respuesta a PetRecord", async () => {
    mockGet.mockResolvedValue({ data: [MASCOTA_BASE], total: 1, lastPage: 1 });
    const { fetchMascotas } = await import("../mascotas");

    const [pet] = await fetchMascotas();
    expect(pet.id).toBe("5");
    expect(pet.nombre).toBe("Firulais");
  });
});

describe("createMascota", () => {
  it("envía el payload mapeado y devuelve el PetRecord creado", async () => {
    mockPost.mockResolvedValue(MASCOTA_BASE);
    const { createMascota } = await import("../mascotas");

    const result = await createMascota({
      nombre: "Firulais",
      especie: "Perro",
      raza: "Labrador",
      edad: "3 años",
      peso: "12.5 kg",
      sexo: "Macho",
      fechaNacimiento: "2021-01-01",
      foto: "",
      propietarioId: "7",
    });

    expect(mockPost).toHaveBeenCalledWith(
      "/mascotas",
      expect.objectContaining({ nombre: "Firulais", id_propietario: 7 }),
    );
    expect(result.id).toBe("5");
  });
});

describe("updateMascota", () => {
  it("llama a PUT /mascotas/:id con el payload mapeado", async () => {
    mockPut.mockResolvedValue(MASCOTA_BASE);
    const { updateMascota } = await import("../mascotas");

    await updateMascota({
      id: "5",
      nombre: "Firulais",
      especie: "Perro",
      raza: "Labrador",
      edad: "3 años",
      peso: "12.5 kg",
      sexo: "Macho",
      fechaNacimiento: "2021-01-01",
      foto: "",
      propietarioId: "7",
      propietarioNombre: "Lorena Romero",
    });

    expect(mockPut).toHaveBeenCalledWith(
      "/mascotas/5",
      expect.objectContaining({ nombre: "Firulais" }),
    );
  });
});

describe("deleteMascota", () => {
  it("llama a DELETE /mascotas/:id", async () => {
    mockDelete.mockResolvedValue(undefined);
    const { deleteMascota } = await import("../mascotas");

    await deleteMascota("5");
    expect(mockDelete).toHaveBeenCalledWith("/mascotas/5");
  });
});
