import { api } from "./client";
import type { InventoryItem } from "../recepcionista/types";

interface ProductoAPI {
  id_producto: number;
  nombre: string | null;
  tipo: string | null;
  precio: number | string | null;
  stock: number | null;
}

function calcStatus(stock: number | null): InventoryItem["status"] {
  if (stock == null || stock === 0) return "Agotado";
  if (stock < 10) return "Stock bajo";
  return "Disponible";
}

function mapProductoToInventoryItem(p: ProductoAPI): InventoryItem {
  return {
    id: String(p.id_producto),
    name: p.nombre ?? "",
    category: "Inventario",
    available: p.stock ?? 0,
    status: calcStatus(p.stock),
  };
}

export async function fetchProductos(): Promise<InventoryItem[]> {
  const data = await api.get<ProductoAPI[]>("/productos");
  return data.map(mapProductoToInventoryItem);
}
