import { db } from "@/db/db";
import { appointments, orders, paymentMethods } from "@/db/turso/schema";
import AppError from "@/utils/AppError";
import { createPreference, getPayment } from "@/utils/mercadopago.client";
import { eq } from "drizzle-orm";
import { Router } from "express";

const MPRouter = Router();

MPRouter.post("/create-preference", async (req, res, next) => {
  const data = req.body;

  try {
    const result = await db.transaction(async (tx) => {
      if (data.appointmentId) {
        const apt = await tx.query.appointments.findFirst({
          where: eq(appointments.id, data.appointmentId),
        });
        if (!apt) throw new AppError("El turno no existe", 404);
      }

      const pm = await tx.query.paymentMethods.findFirst({
        where: eq(paymentMethods.id, data.paymentMethodId),
      });

      if (!pm) {
        throw new AppError("Método de pago inexistente", 404);
      }

      try {
        const [created] = await tx.insert(orders).values(data).returning();
        if (!created) throw new Error("No se pudo generar la orden");

        const res = await createPreference({
          items: data.items,
          orderId: created.id,
          payerEmail: data.payerEmail,
          payerName: data.payerName,
        });
        return res;
      } catch (err: any) {
        if (err.message?.includes("UNIQUE")) {
          throw new AppError(
            "Este turno ya tiene una orden de pago asociada",
            409,
          );
        }
        throw err;
      }
    });

    console.log({ result });

    if (!result) {
      return res.status(400).json({
        message: "Error al crear la preferencia",
        data: null,
      });
    }

    return res.status(201).json({
      message: "Preferencia creada",
      data: result,
    });
  } catch (err: any) {
    next(err);
  }
});

MPRouter.get("/payment-status/:id", async (req, res) => {
  const id = req.params.id as string;

  if (!id) {
    return res.status(404).json({
      message: "ID NO VÁLIDA",
      data: null,
    });
  }

  try {
    const response = await getPayment(id);

    if (!response) {
      return res.status(404).json({
        message: "PAGO NO ENCONTRADO",
        data: null,
      });
    }

    return res.status(200).json({
      message: "Pago encontrado",
      data: response,
    });
  } catch (err: any) {
    const status = err.status ?? "500";
    const message = err.message ?? "SERVER ERROR";
    return res.status(status).json({
      message,
      data: null,
    });
  }
});

export default MPRouter;
