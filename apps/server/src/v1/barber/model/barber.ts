import { db } from "@/db/db";
import { barbers, barberSchedules } from "@/db/turso/schema";
import { dayOfWeekInBusinessTimeZone } from "@config/utils";
import { and, eq } from "drizzle-orm";

interface CreateBarberData {
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  experienceYears?: number;
  userId?: string;
}

interface UpdateBarberData {
  name?: string;
  slug?: string;
  bio?: string;
  avatarUrl?: string;
  experienceYears?: number;
  isActive?: boolean;
  userId?: string;
}

interface UpdateBarberSchedule {
  barberId: string;
  dayOfWeek: number;
  endTime: string;
  isActive: boolean;
  startTime: string;
  startBreak: string;
  endBreak: string;
  appointmentMode: "appointment" | "walk_in";
}

interface ScheduleInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  startBreak: string;
  endBreak: string;
  isActive?: boolean;
  slotDurationMinutes?: number;
  appointmentMode: "appointment" | "walk_in";
}

export default class BarberModel {
  static async getAll({ includeInactive = false } = {}) {
    return db.query.barbers.findMany({
      where: includeInactive ? undefined : eq(barbers.isActive, true),
      orderBy: (b, { asc }) => [asc(b.name)],
      with: {
        schedules: true,
      },
    });
  }

  static async getBySlug(slug: string) {
    const barber = await db.query.barbers.findFirst({
      where: eq(barbers.slug, slug),
      with: {
        schedules: {
          where: (s) => eq(s.isActive, true),
        },
      },
    });
    return barber ?? null;
  }

  static async getById(id: string) {
    const barber = await db.query.barbers.findFirst({
      where: eq(barbers.id, id),
    });
    return barber ?? null;
  }

  /** Perfil de barbero vinculado a una cuenta de usuario (por userId). */
  static async getByUserId(userId: string) {
    const barber = await db.query.barbers.findFirst({
      where: eq(barbers.userId, userId),
      with: {
        schedules: {
          where: (s) =>
            and(
              eq(s.isActive, true),
              eq(s.dayOfWeek, dayOfWeekInBusinessTimeZone()),
            ),
        },
      },
    });
    return barber ?? null;
  }

  static async create(data: CreateBarberData) {
    const [created] = await db.insert(barbers).values(data).returning();
    if (!created) throw new Error("No se pudo crear el barbero");
    return created;
  }

  static async update(id: string, data: UpdateBarberData) {
    if (Object.keys(data).length === 0) {
      throw new Error("No se enviaron campos para actualizar");
    }
    const [updated] = await db
      .update(barbers)
      .set(data)
      .where(eq(barbers.id, id))
      .returning();
    return updated ?? null;
  }

  static async updateSchedule(id: string, data: UpdateBarberSchedule) {
    if (Object.keys(data).length === 0) {
      throw new Error("No se enviaron campos para actualizar");
    }

    const [update] = await db
      .update(barberSchedules)
      .set(data)
      .where(eq(barberSchedules.id, id))
      .returning();

    return update ?? null;
  }
  static async createSchedule(data: UpdateBarberSchedule) {
    if (Object.keys(data).length === 0) {
      throw new Error("No se pudo guardar el horario");
    }

    const [created] = await db
      .insert(barberSchedules)
      .values({ ...data, slotDurationMinutes: 30 })
      .returning();

    return created ?? null;
  }

  /**
   * Reemplaza por completo la grilla horaria de un barbero: borra la anterior
   * e inserta solo los días activos. Es idempotente — el front manda la semana
   * entera y esto evita duplicados, deja persistida la desactivación de un día
   * y mantiene la disponibilidad siempre en sincronía con lo que se ve en el
   * panel. No hay FKs hacia barber_schedules, así que el borrado es seguro.
   */
  static async replaceSchedules(barberId: string, schedules: ScheduleInput[]) {
    const activos = schedules.filter((s) => s.isActive);

    return db.transaction(async (tx) => {
      await tx
        .delete(barberSchedules)
        .where(eq(barberSchedules.barberId, barberId));

      if (activos.length === 0) return [];

      return tx
        .insert(barberSchedules)
        .values(
          activos.map((s) => ({
            barberId,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            startBreak: s.startBreak,
            endBreak: s.endBreak,
            slotDurationMinutes: s.slotDurationMinutes ?? 30,
            isActive: true,
            appointmentMode: s.appointmentMode,
          })),
        )
        .returning();
    });
  }

  /** Soft-delete — nunca borrar un barbero con historial de turnos */
  static async remove(id: string) {
    const [removed] = await db
      .update(barbers)
      .set({ isActive: false })
      .where(eq(barbers.id, id))
      .returning();
    return removed ?? null;
  }
}
