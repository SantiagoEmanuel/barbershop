import { db } from "@/db/db";
import {
  appointments,
  barberScheduleOverrides,
  barberSchedules,
  overbookedAppointments,
} from "@/db/turso/schema";
import {
  filterOccupiedSlots,
  generateSlots,
  type Slot,
} from "@/utils/availability";
import { dayOfWeekForBusinessDate } from "@config/utils";
import { and, eq, inArray } from "drizzle-orm";

export default class AvailabilityModel {
  static async getSlots(barberId: string, date: string): Promise<Slot[]> {
    // date es "YYYY-MM-DD" — dayOfWeek: 0 domingo … 6 sábado.
    // La fecha representa el calendario argentino, no el huso del servidor.
    const dayOfWeek = dayOfWeekForBusinessDate(date);

    // 1. Horario base semanal del barbero para ese día.
    //    barberId es el id real del barbero (no el userId de su cuenta).
    const schedule = await db.query.barberSchedules.findFirst({
      where: and(
        eq(barberSchedules.barberId, barberId),
        eq(barberSchedules.dayOfWeek, dayOfWeek),
        eq(barberSchedules.isActive, true),
      ),
    });

    // El barbero no trabaja ese día de la semana
    if (!schedule || schedule.appointmentMode !== "appointment") return [];

    let { startTime, endTime } = schedule;
    const { startBreak, endBreak } = schedule;
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
    const slots = generateSlots({
      startTime,
      endTime,
      slotDurationMinutes,
      startBreak,
      endBreak,
    });
    if (slots.length === 0) return [];

    // 4. Turnos ya ocupados (pending o confirmed) — status cancelled/no_show quedan libres
    const [regularOccupied, extraordinaryOccupied] = await Promise.all([
      db.query.appointments.findMany({
        where: and(
          eq(appointments.barberId, barberId),
          eq(appointments.date, date),
          inArray(appointments.status, ["pending", "confirmed", "completed"]),
        ),
        columns: { startTime: true, endTime: true },
      }),
      db.query.overbookedAppointments.findMany({
        where: and(
          eq(overbookedAppointments.barberId, barberId),
          eq(overbookedAppointments.date, date),
          inArray(overbookedAppointments.status, [
            "pending",
            "confirmed",
            "completed",
          ]),
        ),
        columns: { startTime: true, endTime: true },
      }),
    ]);
    const occupied = [...regularOccupied, ...extraordinaryOccupied];

    // 5. Filtrar colisiones y retornar slots disponibles
    return filterOccupiedSlots(slots, occupied);
  }
}
