import { db } from "@/db/db";
import { appointments, orders } from "@/db/turso/schema";
import AppError from "@/utils/AppError";
import { eq } from "drizzle-orm";

interface CreateOrderData {
  appointmentId?: string;
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
    if (data.appointmentId) {
      const apt = await db.query.appointments.findFirst({
        where: eq(appointments.id, data.appointmentId),
      });
      if (!apt)
        throw Object.assign(new Error("El turno no existe"), { status: 404 });
    }

    try {
      const [created] = await db.insert(orders).values(data).returning();
      if (!created) throw new Error("No se pudo generar la orden");
      return created;
    } catch (err: any) {
      if (err.message?.includes("UNIQUE")) {
        throw new AppError(
          "Este turno ya tiene una orden de pago asociada",
          409,
        );
      }
      throw err;
    }
  }

  static async getByDate(date: Date) {
    const dateStr = date.toISOString().split("T")[0] as string;

    const allOrders = await db.query.orders.findMany({
      with: {
        appointment: {
          with: { barber: true, service: true, client: true },
        },
        paymentMethod: true,
      },
    });

    return allOrders.filter((o) => {
      const d =
        o.appointment?.date ??
        (o.createdAt instanceof Date
          ? o.createdAt.toISOString()
          : String(o.createdAt)
        ).split("T")[0];
      return d === dateStr;
    });
  }

  static async getAll() {
    return db.query.orders.findMany({
      with: {
        appointment: {
          with: { barber: true, service: true, client: true },
        },
        paymentMethod: true,
      },
      orderBy: (o, { desc }) => [desc(o.createdAt)],
    });
  }

  static async getById(id: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        appointment: {
          with: { barber: true, service: true },
        },
        paymentMethod: true,
      },
    });
    return order ?? null;
  }

  static async update(id: string, data: UpdateOrderData) {
    const existing = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    });
    if (!existing) throw new AppError("Orden no encontrada", 404);

    const patch = { ...data } as Record<string, unknown>;

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
