/**
 * Convierte "HH:MM" a minutos totales desde medianoche.
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

/**
 * Convierte minutos totales a string "HH:MM".
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export interface Slot {
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

interface GenerateSlotsParams {
  startTime: string; // "09:00"
  endTime: string; // "19:00"
  slotDurationMinutes: number; // 30
}

/**
 * Genera slots horarios consecutivos entre startTime y endTime.
 * El último slot no puede superar endTime.
 */
export function generateSlots({
  startTime,
  endTime,
  slotDurationMinutes,
}: GenerateSlotsParams): Slot[] {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (start >= end || slotDurationMinutes <= 0) return [];

  const slots: Slot[] = [];
  let current = start;

  while (current + slotDurationMinutes <= end) {
    slots.push({
      startTime: minutesToTime(current),
      endTime: minutesToTime(current + slotDurationMinutes),
    });
    current += slotDurationMinutes;
  }

  return slots;
}

/**
 * Filtra slots que colisionan con appointments ya ocupados.
 * Un slot está ocupado si su startTime cae dentro del rango [apt.startTime, apt.endTime).
 */
export function filterOccupiedSlots(
  slots: Slot[],
  occupied: Array<{ startTime: string; endTime: string }>,
): Slot[] {
  if (occupied.length === 0) return slots;

  return slots.filter((slot) => {
    const slotStart = timeToMinutes(slot.startTime);
    return !occupied.some((apt) => {
      const aptStart = timeToMinutes(apt.startTime);
      const aptEnd = timeToMinutes(apt.endTime);
      return slotStart >= aptStart && slotStart < aptEnd;
    });
  });
}
