import { DbOrTx, db } from "@/db/db";
import { publicUserColumns } from "@/db/turso/publicUserColumns";
import {
  appointments,
  barbers,
  orders,
  overbookedAppointments,
  paymentMethods,
  productSales,
  products,
  services,
} from "@/db/turso/schema";
import type { Role } from "@/middleware/permissions";
import AppError from "@/utils/AppError";
import { businessDate } from "@config/utils";
import { and, eq, gte, sql } from "drizzle-orm";

interface CreateOrderData {
  appointmentId?: string;
  overbookedAppointmentId?: string;
  paymentMethodId: string;
  actor?: { id: string; role: Role };
}

export interface CounterSaleItem {
  kind: "product" | "service";
  id: string;
  quantity: number;
  priceSnapshot?: number;
}

interface CreatePaidCounterSaleData {
  appointmentId?: string;
  overbookedAppointmentId?: string;
  paymentMethodId: string;
  /** Legacy input; never used to calculate or persist the order amount. */
  amount?: number;
  soldBy?: string;
  items: CounterSaleItem[];
  sellerUserId?: string;
}

interface UpdateOrderData {
  paymentMethodId?: string;
  status?: "pending" | "paid" | "refunded" | "failed";
  paidAt?: Date;
}

/** Los IDs opcionales nunca deben llegar a la base como cadena vacía. */
function normalizeOptionalId(value?: string | null) {
  const normalized = value?.trim();
  return normalized || undefined;
}

export default class OrderModel {
  static async create(data: CreateOrderData, connection: DbOrTx = db) {
    const appointmentId = normalizeOptionalId(data.appointmentId);
    const overbookedAppointmentId = normalizeOptionalId(
      data.overbookedAppointmentId,
    );

    if (appointmentId && overbookedAppointmentId) {
      throw new AppError("Una orden solo puede asociarse a un turno", 400);
    }
    if (!appointmentId && !overbookedAppointmentId) {
      throw new AppError("La orden debe estar asociada a un turno", 400);
    }

    let apt;
    let ova;
    if (appointmentId) {
      apt = await connection.query.appointments.findFirst({
        where: eq(appointments.id, appointmentId),
      });
      if (!apt) throw new AppError("El turno no existe", 404);
    }

    if (overbookedAppointmentId) {
      ova = await connection.query.overbookedAppointments.findFirst({
        where: eq(overbookedAppointments.id, overbookedAppointmentId),
      });
      if (!ova) throw new AppError("El sobre turno no existe", 404);
    }

    const linkedAppointment = apt ?? ova;
    if (
      !linkedAppointment ||
      ["cancelled", "no_show"].includes(linkedAppointment.status)
    ) {
      throw new AppError("No se puede cobrar un turno cancelado", 409);
    }
    if (
      data.actor?.role === "client" &&
      ("clientId" in linkedAppointment
        ? linkedAppointment.clientId !== data.actor.id
        : true)
    ) {
      throw new AppError("No podés crear una orden para otro cliente", 403);
    }

    const amount = linkedAppointment.priceSnapshot;
    if (amount <= 0) {
      throw new AppError("El turno no tiene un precio válido", 409);
    }

    const pm = await connection.query.paymentMethods.findFirst({
      where: eq(paymentMethods.id, data.paymentMethodId),
    });

    if (!pm || !pm.isActive || (pm.type !== "cash" && pm.type !== "card")) {
      throw new AppError("Método de pago inexistente", 404);
    }

    try {
      const [created] = await connection
        .insert(orders)
        .values({
          paymentMethodId: data.paymentMethodId,
          amount,
          status: "pending",
          appointmentId: apt?.id ?? null,
          overbookedAppointmentId: ova?.id ?? null,
        })
        .returning();
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

  /**
   * Registra un cierre de servicio completo de forma atómica. Los precios,
   * costos y stock se leen del backend; el cliente sólo propone cantidades.
   */
  static async createPaidCounterSale(data: CreatePaidCounterSaleData) {
    return db.transaction(async (tx) => {
      const appointmentId = normalizeOptionalId(data.appointmentId);
      const overbookedAppointmentId = normalizeOptionalId(
        data.overbookedAppointmentId,
      );

      if (appointmentId && overbookedAppointmentId) {
        throw new AppError("Una orden solo puede asociarse a un turno", 400);
      }

      const seller = data.sellerUserId
        ? await tx.query.barbers.findFirst({
            where: eq(barbers.userId, data.sellerUserId),
          })
        : data.soldBy
          ? await tx.query.barbers.findFirst({
              where: eq(barbers.id, data.soldBy),
            })
          : undefined;
      if (!seller) throw new AppError("Barbero vendedor inválido", 400);
      const sellerId = seller.id;

      const paymentMethod = await tx.query.paymentMethods.findFirst({
        where: eq(paymentMethods.id, data.paymentMethodId),
      });
      if (
        !paymentMethod ||
        !paymentMethod.isActive ||
        (paymentMethod.type !== "cash" && paymentMethod.type !== "card")
      ) {
        throw new AppError("Método de pago inexistente", 404);
      }

      let appointment: (typeof appointments)["$inferSelect"] | undefined;
      let overbookedAppointment:
        (typeof overbookedAppointments)["$inferSelect"] | undefined;

      if (appointmentId) {
        appointment = await tx.query.appointments.findFirst({
          where: eq(appointments.id, appointmentId),
        });
        if (!appointment) throw new AppError("El turno no existe", 404);
      }
      if (overbookedAppointmentId) {
        overbookedAppointment = await tx.query.overbookedAppointments.findFirst(
          {
            where: eq(overbookedAppointments.id, overbookedAppointmentId),
          },
        );
        if (!overbookedAppointment) {
          throw new AppError("El sobre turno no existe", 404);
        }
      }

      const linkedAppointment = appointment ?? overbookedAppointment;
      if (
        linkedAppointment &&
        ["cancelled", "completed", "no_show"].includes(linkedAppointment.status)
      ) {
        throw new AppError("El turno ya no puede cerrarse", 409);
      }

      if (
        linkedAppointment &&
        data.sellerUserId &&
        linkedAppointment.barberId !== seller.id
      ) {
        throw new AppError("El turno no pertenece al barbero vendedor", 403);
      }

      let expectedAmount =
        appointment?.priceSnapshot ?? overbookedAppointment?.priceSnapshot ?? 0;
      const productItems = data.items.filter((item) => item.kind === "product");
      const serviceItems = data.items.filter((item) => item.kind === "service");

      if (appointment || overbookedAppointment) {
        const serviceId =
          appointment?.serviceId ?? overbookedAppointment?.serviceId;
        for (const item of serviceItems) {
          if (item.id !== serviceId || item.quantity !== 1) {
            throw new AppError("El servicio del turno no coincide", 400);
          }
        }
      } else {
        for (const item of serviceItems) {
          const service = await tx.query.services.findFirst({
            where: eq(services.id, item.id),
          });
          if (!service || !service.isActive) {
            throw new AppError("Servicio inválido", 400);
          }
          if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            throw new AppError("Cantidad de servicio inválida", 400);
          }
          expectedAmount += service.price * item.quantity;
        }
      }

      for (const item of productItems) {
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          throw new AppError("Cantidad de producto inválida", 400);
        }
        const product = await tx.query.products.findFirst({
          where: eq(products.id, item.id),
        });
        if (!product || !product.isActive) {
          throw new AppError("Producto inválido", 400);
        }
        if (product.stock < item.quantity) {
          throw new AppError(
            `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
            400,
          );
        }
        expectedAmount += product.price * item.quantity;
      }

      const [order] = await tx
        .insert(orders)
        .values({
          appointmentId: appointment?.id ?? null,
          overbookedAppointmentId: overbookedAppointment?.id ?? null,
          paymentMethodId: data.paymentMethodId,
          amount: expectedAmount,
          status: "paid",
          paidAt: new Date(),
        })
        .returning();
      if (!order) throw new AppError("No se pudo generar la orden", 500);

      for (const item of productItems) {
        const product = await tx.query.products.findFirst({
          where: eq(products.id, item.id),
        });
        if (!product) throw new AppError("Producto inválido", 400);

        await tx.insert(productSales).values({
          productId: product.id,
          orderId: order.id,
          soldBy: sellerId,
          quantity: item.quantity,
          priceSnapshot: product.price,
          costSnapshot: product.cost,
        });

        const [updated] = await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${item.quantity}` })
          .where(
            and(
              eq(products.id, product.id),
              gte(products.stock, item.quantity),
            ),
          )
          .returning({ id: products.id });
        if (!updated) throw new AppError("No se pudo descontar el stock", 409);
      }

      if (appointment) {
        const [completed] = await tx
          .update(appointments)
          .set({ status: "completed" })
          .where(
            and(
              eq(appointments.id, appointment.id),
              sql`${appointments.status} IN ('pending', 'confirmed')`,
            ),
          )
          .returning({ id: appointments.id });
        if (!completed)
          throw new AppError("El turno ya no puede cerrarse", 409);
      }
      if (overbookedAppointment) {
        const [completed] = await tx
          .update(overbookedAppointments)
          .set({ status: "completed" })
          .where(
            and(
              eq(overbookedAppointments.id, overbookedAppointment.id),
              sql`${overbookedAppointments.status} IN ('pending', 'confirmed')`,
            ),
          )
          .returning({ id: overbookedAppointments.id });
        if (!completed)
          throw new AppError("El turno ya no puede cerrarse", 409);
      }

      return order;
    });
  }
  static async getByDate(date: string) {
    const allOrders = await db.query.orders.findMany({
      with: {
        appointment: {
          with: {
            barber: true,
            service: true,
            client: { columns: publicUserColumns },
          },
        },
        overbookedAppointment: { with: { barber: true, service: true } },
        paymentMethod: true,
      },
    });

    return allOrders.filter((o) => {
      const paidAt = o.paidAt ?? o.createdAt;
      return businessDate(paidAt) === date;
    });
  }

  static async getAll() {
    return db.query.orders.findMany({
      with: {
        appointment: {
          with: {
            barber: true,
            service: true,
            client: { columns: publicUserColumns },
          },
        },
        overbookedAppointment: { with: { barber: true, service: true } },
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
        overbookedAppointment: { with: { barber: true, service: true } },
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

    if (data.paymentMethodId) {
      const paymentMethod = await db.query.paymentMethods.findFirst({
        where: eq(paymentMethods.id, data.paymentMethodId),
      });
      if (!paymentMethod || !paymentMethod.isActive) {
        throw new AppError("Método de pago inexistente", 404);
      }
    }

    if (data.status && data.status !== existing.status) {
      const transitions: Record<
        NonNullable<UpdateOrderData["status"]>,
        NonNullable<UpdateOrderData["status"]>[]
      > = {
        pending: ["pending", "paid", "failed"],
        paid: ["paid", "refunded"],
        failed: ["failed", "pending"],
        refunded: ["refunded"],
      };
      if (!transitions[existing.status].includes(data.status)) {
        throw new AppError(
          `No se puede cambiar una orden de ${existing.status} a ${data.status}`,
          409,
        );
      }
    }

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
