import { db, type DbOrTx } from "@/db/db";
import { supplies } from "@/db/turso/schema";
import AppError from "@/utils/AppError";
import { eq, sql } from "drizzle-orm";

interface CreateSupplyData {
  name: string;
  description?: string;
  unit?: string;
  cost?: number;
  stock: number;
  lowStockThreshold?: number;
}

interface UpdateSupplyData {
  name?: string;
  description?: string;
  unit?: string;
  cost?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
}

export default class SupplyModel {
  static async getAll({ includeInactive = false } = {}) {
    return db.query.supplies.findMany({
      where: includeInactive ? undefined : eq(supplies.isActive, true),
      orderBy: (s, { asc }) => [asc(s.name)],
    });
  }

  static async getById(id: string) {
    const supply = await db.query.supplies.findFirst({
      where: eq(supplies.id, id),
    });
    return supply ?? null;
  }

  static async create(data: CreateSupplyData) {
    if (
      !data.name.trim() ||
      data.name.length > 120 ||
      !Number.isSafeInteger(data.stock) ||
      data.stock < 0 ||
      (data.cost !== undefined &&
        (!Number.isSafeInteger(data.cost) || data.cost < 0))
    ) {
      throw new AppError("Datos de insumo inválidos", 400);
    }
    const [created] = await db.insert(supplies).values(data).returning();
    if (!created) throw new AppError("No se pudo crear el insumo", 500);
    return created;
  }

  static async update(id: string, data: UpdateSupplyData) {
    if (Object.keys(data).length === 0) {
      throw new AppError("No se enviaron campos para actualizar", 400);
    }
    const [updated] = await db
      .update(supplies)
      .set(data)
      .where(eq(supplies.id, id))
      .returning();
    return updated ?? null;
  }

  /**
   * Aumenta el stock de un insumo y, opcionalmente, actualiza su costo.
   * Usado por el ingreso de stock por compras. Acepta `tx` para correr
   * dentro de una transacción existente.
   */
  static async incrementStock(
    id: string,
    quantity: number,
    newCost?: number,
    tx: DbOrTx = db,
  ) {
    const set: Record<string, unknown> = {
      stock: sql`${supplies.stock} + ${quantity}`,
    };
    if (newCost !== undefined) set.cost = newCost;

    const [updated] = await tx
      .update(supplies)
      .set(set)
      .where(eq(supplies.id, id))
      .returning();

    if (!updated) throw new AppError("Insumo no encontrado", 404);
    return updated;
  }

  /** Soft-delete */
  static async remove(id: string) {
    const [removed] = await db
      .update(supplies)
      .set({ isActive: false })
      .where(eq(supplies.id, id))
      .returning();
    return removed ?? null;
  }
}
