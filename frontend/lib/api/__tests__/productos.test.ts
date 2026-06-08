import { vi, describe, it, expect, beforeEach } from "vitest";

const mockGet = vi.fn();

vi.mock("../client", () => ({
  api: { get: (...args: unknown[]) => mockGet(...args) },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchProductos", () => {
  it("mapea productos a InventoryItem calculando el status según el stock", async () => {
    mockGet.mockResolvedValue([
      { id_producto: 1, nombre: "Alimento", tipo: "Comida", precio: "100", stock: 50 },
      { id_producto: 2, nombre: "Vacuna", tipo: "Medicina", precio: "200", stock: 5 },
      { id_producto: 3, nombre: "Jeringa", tipo: "Insumo", precio: "10", stock: 0 },
      { id_producto: 4, nombre: "Collar", tipo: "Accesorio", precio: "50", stock: null },
    ]);
    const { fetchProductos } = await import("../productos");

    const items = await fetchProductos();

    expect(mockGet).toHaveBeenCalledWith("/productos");
    expect(items).toEqual([
      { id: "1", name: "Alimento", category: "Inventario", available: 50, status: "Disponible" },
      { id: "2", name: "Vacuna", category: "Inventario", available: 5, status: "Stock bajo" },
      { id: "3", name: "Jeringa", category: "Inventario", available: 0, status: "Agotado" },
      { id: "4", name: "Collar", category: "Inventario", available: 0, status: "Agotado" },
    ]);
  });

  it("rellena el nombre vacío cuando viene nulo", async () => {
    mockGet.mockResolvedValue([
      { id_producto: 1, nombre: null, tipo: null, precio: null, stock: 20 },
    ]);
    const { fetchProductos } = await import("../productos");

    const [item] = await fetchProductos();
    expect(item.name).toBe("");
  });
});
