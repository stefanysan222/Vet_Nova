import { api } from './client';
import type { Owner } from '../recepcionista/types';

export interface PropietarioAPI {
  id_propietario: number;
  nombre: string | null;
  telefono: string | null;
  direccion: string | null;
  email: string | null;
  documento: string | null;
  estado: string | null;
  mascotas?: { id_mascota: number; nombre: string | null }[];
}

export function mapPropietarioToOwner(p: PropietarioAPI): Owner {
  return {
    id: String(p.id_propietario),
    name: p.nombre ?? '',
    email: p.email ?? '',
    phone: p.telefono ?? '',
    address: p.direccion ?? '',
    documento: p.documento ?? '',
    estado: p.estado === 'inactivo' ? 'Inactivo' : 'Activo',
    mascotas: p.mascotas?.map((m) => m.nombre ?? '') ?? [],
  };
}

export function mapOwnerToPropietario(
  o: Omit<Owner, 'id' | 'mascotas'>,
): Omit<PropietarioAPI, 'id_propietario' | 'mascotas'> {
  return {
    nombre: o.name,
    email: o.email || null,
    telefono: o.phone || null,
    direccion: o.address || null,
    documento: o.documento || null,
    estado: o.estado === 'Inactivo' ? 'inactivo' : 'activo',
  };
}

export async function fetchPropietarios(): Promise<Owner[]> {
  const data = await api.get<PropietarioAPI[]>('/propietarios');
  return data.map(mapPropietarioToOwner);
}

export async function createPropietario(
  owner: Omit<Owner, 'id' | 'mascotas'>,
): Promise<Owner> {
  const data = await api.post<PropietarioAPI>(
    '/propietarios',
    mapOwnerToPropietario(owner),
  );
  return mapPropietarioToOwner(data);
}

export async function updatePropietario(owner: Owner): Promise<Owner> {
  const data = await api.put<PropietarioAPI>(
    `/propietarios/${owner.id}`,
    mapOwnerToPropietario(owner),
  );
  return mapPropietarioToOwner(data);
}

export async function deletePropietario(id: string): Promise<void> {
  await api.delete(`/propietarios/${id}`);
}

export async function fetchPropietarioByUsuario(id_usuario: number): Promise<Owner | null> {
  const data = await api.get<PropietarioAPI[]>(`/propietarios?id_usuario=${id_usuario}`);
  return data.length > 0 ? mapPropietarioToOwner(data[0]) : null;
}
