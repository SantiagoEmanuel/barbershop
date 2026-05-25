import type { AppointmentStatus } from "@/v1/routes/appointments/model/appointment";

export function formatARS(cents: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function todayISO() {
  return new Date().toISOString().split("T")[0]!;
}

export function translateStatus(status: AppointmentStatus) {
  switch (status) {
    case "pending":
      return "pendiente";
    case "cancelled":
      return "cancelado";
    case "completed":
      return "completado";
    case "confirmed":
      return "confirmado";
    case "no_show":
      return "oculto";

    default:
      return "inválido";
  }
}
