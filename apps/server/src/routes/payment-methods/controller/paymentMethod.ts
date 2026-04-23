import type { Request, Response } from "express";
import PaymentMethodModel from "../model/paymentMethod";

const VALID_TYPES = ["cash", "card", "online"] as const;
type PaymentMethodType = (typeof VALID_TYPES)[number];

export default class PaymentMethodController {
  static async getAll(req: Request, res: Response): Promise<void> {
    const includeInactive =
      req.query.all === "true" && req.user?.role === "admin";
    try {
      const data = await PaymentMethodModel.getAll({ includeInactive });
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
      const data = await PaymentMethodModel.getById(id as string);
      if (!data) {
        res.status(404).json({
          message: "Método de pago no encontrado",
          data: null,
        });
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
    const { name, type } = req.body as {
      name?: string;
      type?: PaymentMethodType;
    };

    if (!name || !type) {
      res.status(400).json({
        message: "Campos requeridos: name, type",
        data: null,
      });
      return;
    }

    if (!VALID_TYPES.includes(type)) {
      res.status(400).json({
        message: `Tipo inválido. Valores permitidos: ${VALID_TYPES.join(", ")}`,
        data: null,
      });
      return;
    }

    try {
      const data = await PaymentMethodModel.create({ name, type });
      res
        .status(201)
        .json({ message: "Método de pago creado con éxito", data });
    } catch (err: any) {
      res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, isActive } = req.body as {
      name?: string;
      isActive?: boolean;
    };

    // type es inmutable — no se permite modificarlo después de creado
    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = name;
    if (isActive !== undefined) patch.isActive = isActive;

    if (Object.keys(patch).length === 0) {
      res.status(400).json({
        message:
          "No se enviaron campos para actualizar. Campos permitidos: name, isActive",
        data: null,
      });
      return;
    }

    try {
      const data = await PaymentMethodModel.update(id as string, patch);
      if (!data) {
        res.status(404).json({
          message: "Método de pago no encontrado",
          data: null,
        });
        return;
      }
      res.json({ message: "Método de pago actualizado con éxito", data });
    } catch (err: any) {
      res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
}
