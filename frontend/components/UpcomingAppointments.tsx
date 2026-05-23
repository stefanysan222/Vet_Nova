interface Appointment {
  time: string;
  pet: string;
  owner: string;
  service: string;
  status: "Confirmada" | "Pendiente" | "En Proceso";
}

const appointments: Appointment[] = [
  { time: "09:00", pet: "Max", owner: "Juan Pérez", service: "Consulta General", status: "Confirmada" },
  { time: "10:30", pet: "Luna", owner: "María Ruiz", service: "Vacunación", status: "Pendiente" },
  { time: "12:00", pet: "Rocky", owner: "Carlos Gómez", service: "Corte de Uñas", status: "En Proceso" },
  { time: "14:00", pet: "Mila", owner: "Ana Torres", service: "Chequeo Dental", status: "Confirmada" },
];

function badgeColor(status: Appointment["status"]) {
  switch (status) {
    case "Confirmada":
      return "bg-emerald-100 text-emerald-700";
    case "Pendiente":
      return "bg-amber-100 text-amber-700";
    case "En Proceso":
      return "bg-sky-100 text-sky-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function UpcomingAppointments() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Próximas Citas</h2>
        <p className="text-sm text-slate-500">Agenda de citas para hoy y mañana</p>
      </div>
      <div className="space-y-3">
        {appointments.map((item) => (
          <div key={`${item.time}-${item.pet}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-900">{item.time}</span>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${badgeColor(item.status)}`}>
                {item.status}
              </span>
            </div>
            <div className="mt-2 space-y-1 text-xs text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">Mascota:</span> {item.pet}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Dueño:</span> {item.owner}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Tipo:</span> {item.service}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
