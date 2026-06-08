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

describe("fetchNotificacionesCount", () => {
  it("devuelve el conteo de notificaciones", async () => {
    mockGet.mockResolvedValue({ count: 3 });
    const { fetchNotificacionesCount } = await import("../notificaciones");

    expect(await fetchNotificacionesCount()).toBe(3);
    expect(mockGet).toHaveBeenCalledWith("/notificaciones/count");
  });
});

describe("fetchNotificaciones", () => {
  it("consulta todas las notificaciones por defecto", async () => {
    mockGet.mockResolvedValue([]);
    const { fetchNotificaciones } = await import("../notificaciones");

    await fetchNotificaciones();
    expect(mockGet).toHaveBeenCalledWith("/notificaciones");
  });

  it("filtra solo no leídas cuando se solicita", async () => {
    mockGet.mockResolvedValue([]);
    const { fetchNotificaciones } = await import("../notificaciones");

    await fetchNotificaciones(true);
    expect(mockGet).toHaveBeenCalledWith("/notificaciones?no_leidas=true");
  });
});

describe("marcarLeida / marcarTodasLeidas", () => {
  it("marcarLeida llama a PATCH /notificaciones/:id/leer", async () => {
    mockPatch.mockResolvedValue(undefined);
    const { marcarLeida } = await import("../notificaciones");

    await marcarLeida(9);
    expect(mockPatch).toHaveBeenCalledWith("/notificaciones/9/leer");
  });

  it("marcarTodasLeidas llama a PATCH /notificaciones/leer-todas", async () => {
    mockPatch.mockResolvedValue(undefined);
    const { marcarTodasLeidas } = await import("../notificaciones");

    await marcarTodasLeidas();
    expect(mockPatch).toHaveBeenCalledWith("/notificaciones/leer-todas");
  });
});
