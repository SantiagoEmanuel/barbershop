import { db } from "@/db/db";
import { barbers, barberSchedules } from "@/db/turso/schema";
import { eq } from "drizzle-orm";

interface CreateBarberData {
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  experienceYears?: number;
}

interface UpdateBarberData {
  name?: string;
  slug?: string;
  bio?: string;
  avatarUrl?: string;
  experienceYears?: number;
  isActive?: boolean;
}

interface UpdateBarberSchedule {
  barberId: string;
  dayOfWeek: number;
  endTime: string;
  isActive: boolean;
  startTime: string;
  startBreak: string;
  endBreak: string;
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
          where: (s, { eq }) => eq(s.isActive, true),
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

    const update = await db
      .insert(barberSchedules)
      .values({ ...data, slotDurationMinutes: 30 });

    return update ?? null;
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
