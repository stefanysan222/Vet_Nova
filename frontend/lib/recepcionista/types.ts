export type Owner = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  documento?: string;
  estado?: string;
  mascotas?: string[];
};

export type PetRecord = {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  edad: string;
  peso: string;
  sexo: "Macho" | "Hembra" | "No especificado";
  fechaNacimiento?: string;
  foto?: string;
  propietarioId: string;
  propietarioNombre: string;
};

export type AppointmentStatus =
  | "Pendiente"
  | "Confirmada"
  | "En espera"
  | "En atención"
  | "Finalizada"
  | "Cancelada"
  | "No asistió"
  | "Reprogramada";

export type Appointment = {
  id: string;
  date: string;
  time: string;
  petId: string;
  ownerId: string;
  petName: string;
  ownerName: string;
  service: string;
  status: AppointmentStatus;
  veterinarianId?: number;
  veterinarian?: string;
  notes?: string;
  petEspecie?: string;
  petRaza?: string;
};

export type InventoryCategory = "Inventario" | "Servicio";

export type InventoryItem = {
  id: string;
  name: string;
  category: InventoryCategory;
  available: number;
  status: "Disponible" | "Stock bajo" | "Agotado";
};
