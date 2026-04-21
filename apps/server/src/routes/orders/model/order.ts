import { db } from "@/db/db";
import { orders } from "@/db/turso/schema";
import { eq } from "drizzle-orm";

export type Order = {
  id: string;
  serviceId: string;
  shiftId: string;
  paymentMethodId: string;
  email: string;
  paymentStatus: string | "PENDING";
  createdAt: Date | null;
};

interface Props {
  generate: {
    serviceId: string;
    shiftId: string;
    paymentMethodId: string;
    email: string;
  };
  update: {
    id: string;
    data: Order;
  };
}

export default class OrderModel {
  static async generate({
    serviceId,
    shiftId,
    paymentMethodId,
    email,
  }: Props["generate"]) {
    try {
      const [newOrder] = await db
        .insert(orders)
        .values({
          serviceId,
          shiftId,
          paymentMethodId,
          email,
        })
        .returning();

      return newOrder;
    } catch (err: any) {
      throw new Error(err.message || "No se pudo generar la orden");
    }
  }
  static async update({ id, data }: Props["update"]) {
    try {
      const [orderUpdate] = await db
        .update(orders)
        .set({
          paymentMethodId: data.paymentMethodId,
          paymentStatus: data.paymentStatus,
          shiftId: data.shiftId,
        })
        .where(eq(orders.id, id))
        .returning();

      return orderUpdate;
    } catch (err: any) {
      throw new Error(err.message || "No se pudo actualizar la orden");
    }
  }
}
