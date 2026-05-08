export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

/**
 * Forma única para Appointment. Los campos de service/barber/client van
 * tipados como Partial porque el backend a veces los popula y a veces no
 * dependiendo del endpoint (lista vs detalle).
 */
export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  priceSnapshot: number;
  notes?: string;
  service: {
    id?: string;
    name: string;
    durationMinutes?: number;
    price?: number;
  };
  barber: {
    id?: string;
    name: string;
  };
  client?: {
    id: string;
    name: string;
  };
}
