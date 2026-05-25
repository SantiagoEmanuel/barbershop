import type { Barber } from "./barber";
import type { Service } from "./service";
import type { User } from "./user";

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
  service: Service;
  barber: Barber;
  client?: User;
  clientEmail: string | null;
}
