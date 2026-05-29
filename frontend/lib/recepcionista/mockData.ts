import type { Appointment, InventoryItem, Owner, PetRecord } from "./types";

const today = new Date().toISOString().slice(0, 10);

export const INITIAL_OWNERS: Owner[] = [
  {
    id: "o1",
    name: "Claudia Ríos",
    email: "claudia.rios@mail.com",
    phone: "+57 300 123 4567",
    address: "Calle 45 #12-34",
  },
  {
    id: "o2",
    name: "Andrés Castillo",
    email: "andres.castillo@mail.com",
    phone: "+57 310 987 6543",
    address: "Carrera 10 #7-89",
  },
];

export const INITIAL_PETS: PetRecord[] = [
  {
    id: "p1",
    nombre: "Milo",
    especie: "Perro",
    raza: "Beagle",
    edad: "4 años",
    peso: "12 kg",
    sexo: "Macho",
    fechaNacimiento: "2019-11-04",
    foto: "",
    propietarioId: "o1",
    propietarioNombre: "Claudia Ríos",
  },
  {
    id: "p2",
    nombre: "Luna",
    especie: "Gato",
    raza: "Siamés",
    edad: "2 años",
    peso: "4.2 kg",
    sexo: "Hembra",
    fechaNacimiento: "2024-01-13",
    foto: "",
    propietarioId: "o2",
    propietarioNombre: "Andrés Castillo",
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "a1",
    date: today,
    time: "09:30",
    petId: "p1",
    ownerId: "o1",
    petName: "Milo",
    ownerName: "Claudia Ríos",
    service: "Consulta general",
    status: "Pendiente",
    veterinarian: "Dr. Rodríguez",
    notes: "Primer control anual",
  },
  {
    id: "a2",
    date: today,
    time: "11:00",
    petId: "p2",
    ownerId: "o2",
    petName: "Luna",
    ownerName: "Andrés Castillo",
    service: "Vacunación",
    status: "Confirmada",
    veterinarian: "Dra. Moreno",
    notes: "Vacuna antirrábica",
  },
  {
    id: "a3",
    date: today,
    time: "14:00",
    petId: "p1",
    ownerId: "o1",
    petName: "Milo",
    ownerName: "Claudia Ríos",
    service: "Control posoperatorio",
    status: "Pendiente",
    veterinarian: "Dr. Rodríguez",
    notes: "Revisión suturas",
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "i1",
    name: "Vacuna antirrábica",
    category: "Inventario",
    available: 12,
    status: "Disponible",
  },
  {
    id: "i2",
    name: "Consulta general",
    category: "Servicio",
    available: 20,
    status: "Disponible",
  },
  {
    id: "i3",
    name: "Desparasitación",
    category: "Servicio",
    available: 4,
    status: "Stock bajo",
  },
  {
    id: "i4",
    name: "Shampoo medicado",
    category: "Inventario",
    available: 2,
    status: "Stock bajo",
  },
  {
    id: "i5",
    name: "Microchip",
    category: "Inventario",
    available: 0,
    status: "Agotado",
  },
];
