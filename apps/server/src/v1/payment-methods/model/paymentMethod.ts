import { db } from "@/db/db";
import { paymentMethods } from "@/db/turso/schema";
import AppError from "@/utils/AppError";
import { and, eq, inArray } from "drizzle-orm";

type PaymentMethodType = "cash" | "card" | "cash-online";

interface CreatePaymentMethodData {
  name: string;
  type: PaymentMethodType;
}

interface UpdatePaymentMethodData {
  name?: string;
  isActive?: boolean;
  // type es inmutable — no se expone aquí intencionalmente
}

export default class PaymentMethodModel {
  static async getAll({ includeInactive = false } = {}) {
    return await db.query.paymentMethods.findMany({
      where: and(
        includeInactive ? undefined : eq(paymentMethods.isActive, true),
        inArray(paymentMethods.type, ["cash", "card", "cash-online"]),
      ),
      orderBy: (pm, { asc }) => [asc(pm.name)],
    });
  }

  static async getById(id: string) {
    const method = await db.query.paymentMethods.findFirst({
      where: and(
        eq(paymentMethods.id, id),
        inArray(paymentMethods.type, ["cash", "card", "cash-online"]),
      ),
    });
    return method ?? null;
  }

  static async create(data: CreatePaymentMethodData) {
    const [created] = await db.insert(paymentMethods).values(data).returning();
    if (!created) throw new AppError("No se pudo crear el método de pago", 500);
    return created;
  }

  static async update(id: string, data: UpdatePaymentMethodData) {
    if (Object.keys(data).length === 0) {
      throw new AppError("No se enviaron campos para actualizar", 400);
    }
    const [updated] = await db
      .update(paymentMethods)
      .set(data)
      .where(eq(paymentMethods.id, id))
      .returning();
    return updated ?? null;
  }
}
