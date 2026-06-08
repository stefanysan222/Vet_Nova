import { vi, describe, it, expect, beforeEach } from "vitest";

const mockGet = vi.fn();
const mockPatch = vi.fn();

vi.mock("../client", () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchMiPerfilVeterinario", () => {
  it("llama a GET /veterinarios/me y devuelve el perfil", async () => {
    const perfil = {
      especialidad: "Cirugía",
      registroProfesional: "RP-123",
      telefono: "+52 555 0000",
      horarioAtencion: "Lun-Vie 9-18",
    };
    mockGet.mockResolvedValue(perfil);
    const { fetchMiPerfilVeterinario } = await import("../veterinarios");

    expect(await fetchMiPerfilVeterinario()).toBe(perfil);
    expect(mockGet).toHaveBeenCalledWith("/veterinarios/me");
  });
});

describe("updateMiPerfilVeterinario", () => {
  it("llama a PATCH /veterinarios/me con los datos provistos", async () => {
    mockPatch.mockResolvedValue({});
    const { updateMiPerfilVeterinario } = await import("../veterinarios");

    await updateMiPerfilVeterinario({ especialidad: "Dermatología" });
    expect(mockPatch).toHaveBeenCalledWith("/veterinarios/me", { especialidad: "Dermatología" });
  });
});
