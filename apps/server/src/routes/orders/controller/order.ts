import type { Request, Response } from "express";
import OrderModel from "../model/order";

const VALID_STATUSES = ["pending", "paid", "refunded", "failed"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

export default class OrderController {
  static async getOrders(req: Request, res: Response): Promise<void> {
    const rawDate = req.query.date as string | undefined;
    const date = rawDate ? new Date(rawDate) : new Date();

    if (isNaN(date.getTime())) {
      res.status(400).json({
        message: "Formato de fecha inválido. Usar: YYYY-MM-DD",
        data: null,
      });
      return;
    }

    try {
      const data = await OrderModel.getByDate(date);
      res.json({ message: "OK", data });
    } catch (err: any) {
      res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const data = await OrderModel.getById(id as string);
      if (!data) {
        res.status(404).json({ message: "Orden no encontrada", data: null });
        return;
      }
      res.json({ message: "OK", data });
    } catch (err: any) {
      res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const { appointmentId, paymentMethodId, amount } = req.body as {
      appointmentId?: string;
      paymentMethodId?: string;
      amount?: number;
    };

    if (!appointmentId || !paymentMethodId || amount == null) {
      res.status(400).json({
        message: "Campos requeridos: appointmentId, paymentMethodId, amount",
        data: null,
      });
      return;
    }

    if (typeof amount !== "number" || amount <= 0) {
      res.status(400).json({
        message: "El monto debe ser un número positivo en centavos",
        data: null,
      });
      return;
    }

    try {
      const data = await OrderModel.create({
        appointmentId,
        paymentMethodId,
        amount,
      });
      res.status(201).json({ message: "Orden generada con éxito", data });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const {
      paymentMethodId,
      status,
      externalPaymentId,
      externalPaymentUrl,
      externalPaymentStatus,
    } = req.body as {
      paymentMethodId?: string;
      status?: OrderStatus;
      externalPaymentId?: string;
      externalPaymentUrl?: string;
      externalPaymentStatus?: string;
    };

    if (status && !VALID_STATUSES.includes(status)) {
      res.status(400).json({
        message: `Status inválido. Valores permitidos: ${VALID_STATUSES.join(", ")}`,
        data: null,
      });
      return;
    }

    const patch: Record<string, unknown> = {};
    if (paymentMethodId !== undefined) patch.paymentMethodId = paymentMethodId;
    if (status !== undefined) patch.status = status;
    if (externalPaymentId !== undefined)
      patch.externalPaymentId = externalPaymentId;
    if (externalPaymentUrl !== undefined)
      patch.externalPaymentUrl = externalPaymentUrl;
    if (externalPaymentStatus !== undefined)
      patch.externalPaymentStatus = externalPaymentStatus;

    if (Object.keys(patch).length === 0) {
      res.status(400).json({
        message: "No se enviaron campos para actualizar",
        data: null,
      });
      return;
    }

    try {
      const data = await OrderModel.update(id as string, patch as any);
      if (!data) {
        res.status(404).json({ message: "Orden no encontrada", data: null });
        return;
      }
      res.json({ message: "Orden actualizada con éxito", data });
    } catch (err: any) {
      const httpStatus = typeof err.status === "number" ? err.status : 500;
      res
        .status(httpStatus)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
}
