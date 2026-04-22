import { db } from "@/db/db";
import {
  appointments,
  barberScheduleOverrides,
  barberSchedules,
} from "@/db/turso/schema";
import {
  filterOccupiedSlots,
  generateSlots,
  type Slot,
} from "@/utils/availability";
import { and, eq, inArray } from "drizzle-orm";

export default class AvailabilityModel {
  static async getSlots(barberId: string, date: string): Promise<Slot[]> {
    // date es "YYYY-MM-DD" — dayOfWeek: 0 domingo … 6 sábado
    const dayOfWeek = new Date(`${date}T12:00:00`).getDay();

    // 1. Horario base semanal del barbero para ese día
    const schedule = await db.query.barberSchedules.findFirst({
      where: and(
        eq(barberSchedules.barberId, barberId),
        eq(barberSchedules.dayOfWeek, dayOfWeek),
        eq(barberSchedules.isActive, true),
      ),
    });

    // Si el barbero no trabaja ese día → sin slots
    if (!schedule) return [];

    let { startTime, endTime } = schedule;
    const { slotDurationMinutes } = schedule;

    // 2. Excepciones puntuales (feriados / horario modificado)
    const override = await db.query.barberScheduleOverrides.findFirst({
      where: and(
        eq(barberScheduleOverrides.barberId, barberId),
        eq(barberScheduleOverrides.date, date),
      ),
    });

    if (override) {
      if (override.isDayOff) return [];
      if (override.customStartTime) startTime = override.customStartTime;
      if (override.customEndTime) endTime = override.customEndTime;
    }

    // 3. Generar todos los slots del día
    const slots = generateSlots({ startTime, endTime, slotDurationMinutes });
    if (slots.length === 0) return [];

    // 4. Turnos ya ocupados (pending o confirmed)
    const occupied = await db.query.appointments.findMany({
      where: and(
        eq(appointments.barberId, barberId),
        eq(appointments.date, date),
        inArray(appointments.status, ["pending", "confirmed"]),
      ),
      columns: { startTime: true, endTime: true },
    });

    // 5. Filtrar colisiones y retornar slots libres
    return filterOccupiedSlots(slots, occupied);
  }
}
