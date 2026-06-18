import { vi, describe, it, expect, beforeEach } from "vitest";

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

const USUARIOS = [
  { id: 1, nombre: "Ana", email: "ana@test.com", rol: "Veterinario" },
  { id: 2, nombre: "Beto", email: "beto@test.com", rol: "Administrador" },
  { id: 3, nombre: "Caro", email: "caro@test.com", rol: "Cliente" },
  { id: 4, nombre: "Dora", email: "dora@test.com", rol: "Cliente" },
];

describe("fetchUsuarios", () => {
  it("envía page y limit por defecto, y agrega rol codificado solo si se provee", async () => {
    mockGet.mockResolvedValue({ data: USUARIOS, total: 4, page: 1, lastPage: 1 });
    const { fetchUsuarios } = await import("../usuarios");

    await fetchUsuarios();
    expect(mockGet).toHaveBeenCalledWith("/usuarios?page=1&limit=100");

    mockGet.mockClear();
    await fetchUsuarios("Veterinario", 2, 20);
    expect(mockGet).toHaveBeenCalledWith("/usuarios?page=2&limit=20&rol=Veterinario");
  });
});

describe("fetchVeterinarios", () => {
  it("delega en fetchUsuarios filtrando por rol Veterinario", async () => {
    mockGet.mockResolvedValue({ data: USUARIOS, total: 4, page: 1, lastPage: 1 });
    const { fetchVeterinarios } = await import("../usuarios");

    await fetchVeterinarios();
    expect(mockGet).toHaveBeenCalledWith("/usuarios?page=1&limit=100&rol=Veterinario");
  });
});

describe("createUsuario / updateUsuario / deleteUsuario", () => {
  it("createUsuario llama a POST /usuarios con los datos provistos", async () => {
    mockPost.mockResolvedValue(USUARIOS[0]);
    const { createUsuario } = await import("../usuarios");

    await createUsuario({
      nombre: "Ana",
      email: "ana@test.com",
      password: "secreta",
      rol: "Veterinario",
    });
    expect(mockPost).toHaveBeenCalledWith("/usuarios", {
      nombre: "Ana",
      email: "ana@test.com",
      password: "secreta",
      rol: "Veterinario",
    });
  });

  it("updateUsuario llama a PUT /usuarios/:id con los datos provistos", async () => {
    mockPut.mockResolvedValue(USUARIOS[0]);
    const { updateUsuario } = await import("../usuarios");

    await updateUsuario(1, { nombre: "Ana Actualizada" });
    expect(mockPut).toHaveBeenCalledWith("/usuarios/1", { nombre: "Ana Actualizada" });
  });

  it("deleteUsuario llama a DELETE /usuarios/:id", async () => {
    mockDelete.mockResolvedValue(undefined);
    const { deleteUsuario } = await import("../usuarios");

    await deleteUsuario(1);
    expect(mockDelete).toHaveBeenCalledWith("/usuarios/1");
  });
});

describe("fetchStatsAdmin", () => {
  it("calcula los conteos por rol a partir de la lista de usuarios", async () => {
    mockGet.mockResolvedValue({ data: USUARIOS, total: 4, page: 1, lastPage: 1 });
    const { fetchStatsAdmin } = await import("../usuarios");

    expect(await fetchStatsAdmin()).toEqual({
      totalUsuarios: 4,
      veterinarios: 1,
      administradores: 1,
      clientes: 2,
    });
  });
});
