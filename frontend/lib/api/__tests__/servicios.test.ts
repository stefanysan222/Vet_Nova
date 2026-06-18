import { vi, describe, it, expect, beforeEach } from "vitest";

const mockGet = vi.fn();

vi.mock("../client", () => ({
  api: { get: (...args: unknown[]) => mockGet(...args) },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchServicios", () => {
  it("llama a GET /servicios y devuelve la lista tal cual", async () => {
    const servicios = [{ id_servicio: 1, nombre: "Vacunación", precio: "100" }];
    mockGet.mockResolvedValue(servicios);
    const { fetchServicios } = await import("../servicios");

    expect(await fetchServicios()).toBe(servicios);
    expect(mockGet).toHaveBeenCalledWith("/servicios");
  });
});
