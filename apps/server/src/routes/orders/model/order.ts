import { db } from "@/db/db";
import { appointments, orders } from "@/db/turso/schema";
import { eq } from "drizzle-orm";

interface CreateOrderData {
  appointmentId: string;
  paymentMethodId: string;
  amount: number;
}

interface UpdateOrderData {
  paymentMethodId?: string;
  status?: "pending" | "paid" | "refunded" | "failed";
  externalPaymentId?: string;
  externalPaymentUrl?: string;
  externalPaymentStatus?: string;
  paidAt?: Date;
}

export default class OrderModel {
  static async create(data: CreateOrderData) {
    // Verificar que el appointment exista
    const apt = await db.query.appointments.findFirst({
      where: eq(appointments.id, data.appointmentId),
    });
    if (!apt)
      throw Object.assign(new Error("El turno no existe"), { status: 404 });

    try {
      const [created] = await db.insert(orders).values(data).returning();
      if (!created) throw new Error("No se pudo generar la orden");
      return created;
    } catch (err: any) {
      if (err.message?.includes("UNIQUE")) {
        throw Object.assign(
          new Error("Este turno ya tiene una orden de pago asociada"),
          { status: 409 },
        );
      }
      throw err;
    }
  }

  static async getByDate(date: Date) {
    // Filtra órdenes cuyo appointment sea de esa fecha
    const dateStr = date.toISOString().split("T")[0] as string;
    return db.query.orders.findMany({
      with: {
        appointment: {
          where: eq(appointments.date, dateStr),
          with: { barber: true, service: true, client: true },
        },
        paymentMethod: true,
      },
    });
  }

  static async getById(id: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { appointment: true, paymentMethod: true },
    });
    return order ?? null;
  }

  static async update(id: string, data: UpdateOrderData) {
    const existing = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    });
    if (!existing)
      throw Object.assign(new Error("Orden no encontrada"), { status: 404 });

    const patch = { ...data } as Record<string, unknown>;

    // Si se marca como pagado y no viene paidAt, lo seteamos ahora
    if (data.status === "paid" && !data.paidAt) {
      patch.paidAt = new Date();
    }

    const [updated] = await db
      .update(orders)
      .set(patch)
      .where(eq(orders.id, id))
      .returning();

    return updated ?? null;
  }
}
