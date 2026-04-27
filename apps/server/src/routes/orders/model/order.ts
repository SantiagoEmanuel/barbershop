import { db } from "@/db/db";
import { appointments, orders } from "@/db/turso/schema";
import AppError from "@/utils/AppError";
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
    // Verificar que el appointment exista antes de insertar
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
      // El constraint UNIQUE appointments_id actúa como segunda barrera
      if (err.message?.includes("UNIQUE")) {
        throw new AppError(
          "Este turno ya tiene una orden de pago asociada",
          409,
        );
      }
      throw err;
    }
  }

  /**
   * Devuelve todas las órdenes con sus relaciones.
   * El filtro por fecha se aplica en memoria sobre appointment.date
   * porque Drizzle no permite WHERE dentro de .with() de relaciones one-to-one.
   */
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

    // Filtrar por la fecha del appointment en memoria
    return allOrders.filter((o) => o.appointment?.date === dateStr);
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

    // Auto-completar paidAt cuando el status pasa a "paid"
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
