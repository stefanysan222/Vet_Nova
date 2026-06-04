import type { Appointment, InventoryItem, Owner, PetRecord } from "./types";
import {
  fetchPropietarios,
  createPropietario,
  updatePropietario,
  deletePropietario,
} from "../api/propietarios";
import {
  fetchMascotas,
  createMascota,
  updateMascota as updateMascotaApi,
  deleteMascota,
} from "../api/mascotas";
import {
  fetchCitas,
  createCita,
  updateCita,
  updateCitaEstado,
  deleteCita,
} from "../api/citas";
import { fetchProductos } from "../api/productos";

// ─── Owners / Propietarios ────────────────────────────────────────────────────

export async function getOwners(): Promise<Owner[]> {
  return fetchPropietarios();
}

export async function addOwner(owner: Omit<Owner, "id" | "mascotas">): Promise<Owner> {
  return createPropietario(owner);
}

export async function saveOwner(owner: Owner): Promise<Owner> {
  return updatePropietario(owner);
}

export async function removeOwner(id: string): Promise<void> {
  return deletePropietario(id);
}

// ─── Pets / Mascotas ─────────────────────────────────────────────────────────

export async function getPets(): Promise<PetRecord[]> {
  return fetchMascotas();
}

export async function addPet(
  pet: Omit<PetRecord, "id" | "propietarioNombre">,
): Promise<PetRecord> {
  return createMascota(pet);
}

export async function updatePet(pet: PetRecord): Promise<PetRecord> {
  return updateMascotaApi(pet);
}

export async function removePet(id: string): Promise<void> {
  return deleteMascota(id);
}

// ─── Appointments / Citas ────────────────────────────────────────────────────

export async function getAppointments(): Promise<Appointment[]> {
  return fetchCitas();
}

export async function addAppointment(
  appointment: Omit<Appointment, "id">,
): Promise<Appointment> {
  return createCita(appointment);
}

export async function updateAppointment(appointment: Appointment): Promise<Appointment> {
  return updateCita(appointment);
}

export async function setAppointmentStatus(
  id: string,
  status: Appointment["status"],
): Promise<Appointment> {
  return updateCitaEstado(id, status);
}

export async function removeAppointment(id: string): Promise<void> {
  return deleteCita(id);
}

// ─── Inventory / Productos ───────────────────────────────────────────────────

export async function getInventoryItems(): Promise<InventoryItem[]> {
  return fetchProductos();
}
