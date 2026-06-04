import { api } from './client';
import type { PetRecord } from '../recepcionista/types';

export interface MascotaAPI {
  id_mascota: number;
  nombre: string | null;
  especie: string | null;
  raza: string | null;
  edad: number | null;
  peso: number | string | null;
  sexo: string | null;
  fecha_nacimiento: string | null;
  foto: string | null;
  id_propietario: number | null;
  propietario?: {
    id_propietario: number;
    nombre: string | null;
  } | null;
}

export function mapMascotaToPetRecord(m: MascotaAPI): PetRecord {
  return {
    id: String(m.id_mascota),
    nombre: m.nombre ?? '',
    especie: m.especie ?? '',
    raza: m.raza ?? '',
    edad: m.edad != null ? `${m.edad} años` : '',
    peso: m.peso != null ? `${m.peso} kg` : '',
    sexo: (m.sexo as PetRecord['sexo']) ?? 'No especificado',
    fechaNacimiento: m.fecha_nacimiento ?? undefined,
    foto: m.foto ?? '',
    propietarioId: String(m.id_propietario ?? ''),
    propietarioNombre: m.propietario?.nombre ?? '',
  };
}

function parseEdadToInt(edad: string): number | undefined {
  const match = edad.match(/\d+/);
  return match ? parseInt(match[0], 10) : undefined;
}

function parsePesoToFloat(peso: string): number | undefined {
  const match = peso.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : undefined;
}

export function mapPetRecordToMascota(
  p: Omit<PetRecord, 'id' | 'propietarioNombre'>,
): object {
  return {
    nombre: p.nombre,
    especie: p.especie || undefined,
    raza: p.raza || undefined,
    edad: p.edad ? parseEdadToInt(p.edad) : undefined,
    peso: p.peso ? parsePesoToFloat(p.peso) : undefined,
    sexo: p.sexo !== 'No especificado' ? p.sexo : undefined,
    fecha_nacimiento: p.fechaNacimiento || undefined,
    foto: p.foto || undefined,
    id_propietario: p.propietarioId ? parseInt(p.propietarioId, 10) : undefined,
  };
}

export async function fetchMascotas(id_propietario?: number): Promise<PetRecord[]> {
  const path = id_propietario ? `/mascotas?id_propietario=${id_propietario}` : '/mascotas';
  const data = await api.get<MascotaAPI[]>(path);
  return data.map(mapMascotaToPetRecord);
}

export async function createMascota(
  pet: Omit<PetRecord, 'id' | 'propietarioNombre'>,
): Promise<PetRecord> {
  const data = await api.post<MascotaAPI>(
    '/mascotas',
    mapPetRecordToMascota(pet),
  );
  return mapMascotaToPetRecord(data);
}

export async function updateMascota(pet: PetRecord): Promise<PetRecord> {
  const data = await api.put<MascotaAPI>(
    `/mascotas/${pet.id}`,
    mapPetRecordToMascota(pet),
  );
  return mapMascotaToPetRecord(data);
}

export async function deleteMascota(id: string): Promise<void> {
  await api.delete(`/mascotas/${id}`);
}
