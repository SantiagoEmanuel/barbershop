import { db } from "@/db/db";
import { services } from "@/db/turso/schema";
import AppError from "@/utils/AppError";
import { eq } from "drizzle-orm";

interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
}

interface UpdateServiceData {
  name?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
  isActive?: boolean;
}

export default class ServiceModel {
  static async getAll({ includeInactive = false } = {}) {
    const all = await db.query.services.findMany({
      where: includeInactive ? undefined : eq(services.isActive, true),
      orderBy: (s, { asc }) => [asc(s.name)],
    });
    return all;
  }

  static async getById(id: string) {
    const service = await db.query.services.findFirst({
      where: eq(services.id, id),
    });
    return service ?? null;
  }

  static async create(data: CreateServiceData) {
    const [created] = await db.insert(services).values(data).returning();
    if (!created) throw new AppError("No se pudo crear el servicio", 400);
    return created;
  }

  static async update(id: string, data: UpdateServiceData) {
    if (Object.keys(data).length === 0) {
      throw new AppError("No se enviaron campos para actualizar", 400);
    }
    const [updated] = await db
      .update(services)
      .set(data)
      .where(eq(services.id, id))
      .returning();
    return updated ?? null;
  }

  /** Soft-delete: desactiva el servicio sin borrar historial */
  static async remove(id: string) {
    const [removed] = await db
      .update(services)
      .set({ isActive: false })
      .where(eq(services.id, id))
      .returning();
    return removed ?? null;
  }
}
