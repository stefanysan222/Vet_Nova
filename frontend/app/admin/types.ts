export type Usuario = {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  cargo: string;
  estado: "Activo" | "Inactivo";
};
