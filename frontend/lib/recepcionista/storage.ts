import type { Appointment, InventoryItem, Owner, PetRecord } from "./types";
import {
  INITIAL_APPOINTMENTS,
  INITIAL_INVENTORY,
  INITIAL_OWNERS,
  INITIAL_PETS,
} from "./mockData";

const OWNERS_KEY = "vetnova_recepcionista_owners";
const PETS_KEY = "vetnova_recepcionista_pets";
const APPOINTMENTS_KEY = "vetnova_recepcionista_appointments";
const INVENTORY_KEY = "vetnova_recepcionista_inventory";

function isBrowser() {
  return typeof window !== "undefined";
}

function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function broadcastUpdate() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event("vetnova-recepcionista-updated"));
}

export function getOwners(): Owner[] {
  return readStorage<Owner[]>(OWNERS_KEY, INITIAL_OWNERS);
}

export function saveOwners(owners: Owner[]) {
  writeStorage<Owner[]>(OWNERS_KEY, owners);
  broadcastUpdate();
}

export function addOwner(owner: Owner) {
  saveOwners([owner, ...getOwners()]);
}

export function updateOwner(owner: Owner) {
  saveOwners(getOwners().map((item) => (item.id === owner.id ? owner : item)));
}

export function getOwnerById(id: string) {
  return getOwners().find((owner) => owner.id === id);
}

export function getPets(): PetRecord[] {
  const owners = getOwners();
  return readStorage<PetRecord[]>(PETS_KEY, INITIAL_PETS).map((pet) => ({
    ...pet,
    propietarioNombre:
      owners.find((owner) => owner.id === pet.propietarioId)?.name ??
      pet.propietarioNombre,
  }));
}

export function savePets(pets: PetRecord[]) {
  writeStorage<PetRecord[]>(PETS_KEY, pets);
  broadcastUpdate();
}

export function addPet(pet: PetRecord) {
  savePets([pet, ...getPets()]);
}

export function updatePet(pet: PetRecord) {
  savePets(getPets().map((item) => (item.id === pet.id ? pet : item)));
}

export function getPetById(id: string) {
  return getPets().find((pet) => pet.id === id);
}

export function getAppointments(): Appointment[] {
  return readStorage<Appointment[]>(APPOINTMENTS_KEY, INITIAL_APPOINTMENTS);
}

export function saveAppointments(appointments: Appointment[]) {
  writeStorage<Appointment[]>(APPOINTMENTS_KEY, appointments);
  broadcastUpdate();
}

export function addAppointment(appointment: Appointment) {
  saveAppointments([appointment, ...getAppointments()]);
}

export function updateAppointment(appointment: Appointment) {
  saveAppointments(
    getAppointments().map((item) =>
      item.id === appointment.id ? appointment : item,
    ),
  );
}

export function getAppointmentById(id: string) {
  return getAppointments().find((appointment) => appointment.id === id);
}

export function getInventoryItems(): InventoryItem[] {
  return readStorage<InventoryItem[]>(INVENTORY_KEY, INITIAL_INVENTORY);
}

export function saveInventoryItems(items: InventoryItem[]) {
  writeStorage<InventoryItem[]>(INVENTORY_KEY, items);
}
