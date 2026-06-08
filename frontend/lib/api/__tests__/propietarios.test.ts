import { vi, describe, it, expect, beforeEach } from "vitest";
import type { Owner } from "../../recepcionista/types";
import type { PropietarioAPI } from "../propietarios";

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

const PROPIETARIO_BASE: PropietarioAPI = {
  id_propietario: 7,
  nombre: "Lorena Romero",
  telefono: "+52 555 1234",
  direccion: "Calle Falsa 123",
  email: "lorena@test.com",
  documento: "ABC123",
  estado: "activo",
  mascotas: [{ id_mascota: 5, nombre: "Firulais" }],
};

describe("mapPropietarioToOwner", () => {
  it("mapea los campos del API a Owner, normalizando estado y nombres de mascotas", async () => {
    const { mapPropietarioToOwner } = await import("../propietarios");

    expect(mapPropietarioToOwner(PROPIETARIO_BASE)).toEqual({
      id: "7",
      name: "Lorena Romero",
      email: "lorena@test.com",
      phone: "+52 555 1234",
      address: "Calle Falsa 123",
      documento: "ABC123",
      estado: "Activo",
      mascotas: ["Firulais"],
    });
  });

  it("marca como Inactivo cuando estado es 'inactivo' y rellena valores nulos", async () => {
    const { mapPropietarioToOwner } = await import("../propietarios");

    const result = mapPropietarioToOwner({
      ...PROPIETARIO_BASE,
      nombre: null,
      telefono: null,
      direccion: null,
      email: null,
      documento: null,
      estado: "inactivo",
      mascotas: undefined,
    });

    expect(result).toEqual({
      id: "7",
      name: "",
      email: "",
      phone: "",
      address: "",
      documento: "",
      estado: "Inactivo",
      mascotas: [],
    });
  });
});

describe("mapOwnerToPropietario", () => {
  const OWNER: Omit<Owner, "id" | "mascotas"> = {
    name: "Lorena Romero",
    email: "lorena@test.com",
    phone: "+52 555 1234",
    address: "Calle Falsa 123",
    documento: "ABC123",
    estado: "Activo",
  };

  it("mapea Owner al payload del API, traduciendo estado a minúsculas", async () => {
    const { mapOwnerToPropietario } = await import("../propietarios");

    expect(mapOwnerToPropietario(OWNER)).toEqual({
      nombre: "Lorena Romero",
      email: "lorena@test.com",
      telefono: "+52 555 1234",
      direccion: "Calle Falsa 123",
      documento: "ABC123",
      estado: "activo",
    });
  });

  it("envía null para campos vacíos y traduce 'Inactivo' a 'inactivo'", async () => {
    const { mapOwnerToPropietario } = await import("../propietarios");

    expect(
      mapOwnerToPropietario({
        ...OWNER,
        email: "",
        phone: "",
        address: "",
        documento: "",
        estado: "Inactivo",
      }),
    ).toEqual({
      nombre: "Lorena Romero",
      email: null,
      telefono: null,
      direccion: null,
      documento: null,
      estado: "inactivo",
    });
  });
});

describe("fetchPropietarios", () => {
  it("devuelve la lista mapeada a Owner", async () => {
    mockGet.mockResolvedValue([PROPIETARIO_BASE]);
    const { fetchPropietarios } = await import("../propietarios");

    const [owner] = await fetchPropietarios();
    expect(mockGet).toHaveBeenCalledWith("/propietarios");
    expect(owner.id).toBe("7");
    expect(owner.estado).toBe("Activo");
  });
});

describe("createPropietario / updatePropietario / deletePropietario", () => {
  it("createPropietario envía el payload mapeado y devuelve el Owner creado", async () => {
    mockPost.mockResolvedValue(PROPIETARIO_BASE);
    const { createPropietario } = await import("../propietarios");

    const result = await createPropietario({
      name: "Lorena Romero",
      email: "lorena@test.com",
      phone: "+52 555 1234",
      address: "Calle Falsa 123",
      documento: "ABC123",
      estado: "Activo",
    });

    expect(mockPost).toHaveBeenCalledWith(
      "/propietarios",
      expect.objectContaining({ nombre: "Lorena Romero" }),
    );
    expect(result.id).toBe("7");
  });

  it("updatePropietario llama a PUT /propietarios/:id", async () => {
    mockPut.mockResolvedValue(PROPIETARIO_BASE);
    const { updatePropietario } = await import("../propietarios");

    await updatePropietario({
      id: "7",
      name: "Lorena Romero",
      email: "lorena@test.com",
      phone: "+52 555 1234",
      address: "Calle Falsa 123",
      documento: "ABC123",
      estado: "Activo",
      mascotas: ["Firulais"],
    });

    expect(mockPut).toHaveBeenCalledWith(
      "/propietarios/7",
      expect.objectContaining({ nombre: "Lorena Romero" }),
    );
  });

  it("deletePropietario llama a DELETE /propietarios/:id", async () => {
    mockDelete.mockResolvedValue(undefined);
    const { deletePropietario } = await import("../propietarios");

    await deletePropietario("7");
    expect(mockDelete).toHaveBeenCalledWith("/propietarios/7");
  });
});

describe("fetchPropietarioByUsuario", () => {
  it("devuelve el primer propietario mapeado cuando hay resultados", async () => {
    mockGet.mockResolvedValue([PROPIETARIO_BASE]);
    const { fetchPropietarioByUsuario } = await import("../propietarios");

    const owner = await fetchPropietarioByUsuario(3);

    expect(mockGet).toHaveBeenCalledWith("/propietarios?id_usuario=3");
    expect(owner?.id).toBe("7");
  });

  it("devuelve null cuando no hay resultados", async () => {
    mockGet.mockResolvedValue([]);
    const { fetchPropietarioByUsuario } = await import("../propietarios");

    expect(await fetchPropietarioByUsuario(3)).toBeNull();
  });
});
