import { db } from "@/db/db";
import { paymentMethods } from "@/db/turso/schema";
import { eq } from "drizzle-orm";

type PaymentMethodType = "cash" | "card" | "online";

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
    return db.query.paymentMethods.findMany({
      where: includeInactive ? undefined : eq(paymentMethods.isActive, true),
      orderBy: (pm, { asc }) => [asc(pm.name)],
    });
  }

  static async getById(id: string) {
    const method = await db.query.paymentMethods.findFirst({
      where: eq(paymentMethods.id, id),
    });
    return method ?? null;
  }

  static async create(data: CreatePaymentMethodData) {
    const [created] = await db.insert(paymentMethods).values(data).returning();
    if (!created) throw new Error("No se pudo crear el método de pago");
    return created;
  }

  static async update(id: string, data: UpdatePaymentMethodData) {
    if (Object.keys(data).length === 0) {
      throw new Error("No se enviaron campos para actualizar");
    }
    const [updated] = await db
      .update(paymentMethods)
      .set(data)
      .where(eq(paymentMethods.id, id))
      .returning();
    return updated ?? null;
  }
}
