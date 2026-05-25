import { db } from "@/db/db";
import { appointments, orders, paymentMethods } from "@/db/turso/schema";
import AppError from "@/utils/AppError";
import { createPreference } from "@/utils/mercadopago.client";
import { eq } from "drizzle-orm";

interface CreateOrderData {
  appointmentId?: string;
  paymentMethodId: string;
  amount: number;
}

interface CreateOrderDataOnline {
  appointmentId: string;
  paymentMethodId: string;
  items: {
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: "ARS";
  }[];
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
      if (!apt) throw new AppError("El turno no existe", 404);
    }

    const pm = await db.query.paymentMethods.findFirst({
      where: eq(paymentMethods.id, data.paymentMethodId),
    });

    if (!pm) {
      throw new AppError("Método de pago inexistente", 404);
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
  static async createOnline(data: CreateOrderDataOnline) {
    if (data.appointmentId) {
      const apt = await db.query.appointments.findFirst({
        where: eq(appointments.id, data.appointmentId),
      });
      if (!apt) throw new AppError("El turno no existe", 404);
    }

    const pm = await db.query.paymentMethods.findFirst({
      where: eq(paymentMethods.id, data.paymentMethodId),
    });

    if (!pm) {
      throw new AppError("El turno no existe", 404);
    }

    try {
      const [newOrder] = await db
        .insert(orders)
        .values({
          appointmentId: data.appointmentId,
          amount: data.amount,
          paymentMethodId: data.paymentMethodId,
        })
        .returning();
      const preference = await createPreference({
        orderId: newOrder.id,
        items: data.items,
      });

      return preference;
    } catch (err: any) {
      throw new AppError(
        err.message ?? "Error al generar la petición",
        err.status ?? 500,
      );
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
        productSales: true,
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
