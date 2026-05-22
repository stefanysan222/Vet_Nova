// src/dashboard/utils/dashboard-date.util.ts

export function getRangoDia() {
    const hoy = new Date();
  
    const inicioDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
      0,
      0,
      0,
      0,
    );
  
    const finDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate() + 1,
      0,
      0,
      0,
      0,
    );
  
    return {
      inicioDia,
      finDia,
    };
  }