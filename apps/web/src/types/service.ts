export interface Service {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  isActive?: boolean;
  /** Solo se usa en algunos contextos (ordenamiento estable). */
  key?: number;
}

/**
 * Slot horario devuelto por el backend para una fecha y barbero.
 * El step base lo define el backend (slotDurationMinutes en Schedule).
 */
export interface Slot {
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}
