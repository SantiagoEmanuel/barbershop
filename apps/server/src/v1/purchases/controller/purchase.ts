import {
  businessDayEnd,
  businessDayStart,
  isValidBusinessDate,
} from "@config/utils";
import type { Request, Response } from "express";
import PurchaseModel from "../model/purchase";

export default class PurchaseController {
  static async getAll(req: Request, res: Response) {
    const fromRaw = req.query.from as string | undefined;
    const toRaw = req.query.to as string | undefined;
    const itemType = req.query.itemType as "product" | "supply" | undefined;

    if (
      (fromRaw && !isValidBusinessDate(fromRaw)) ||
      (toRaw && !isValidBusinessDate(toRaw))
    ) {
      return res
        .status(400)
        .json({ message: "Rango de fechas inválido", data: null });
    }

    try {
      const data = await PurchaseModel.getAll({
        from: fromRaw ? businessDayStart(fromRaw) : undefined,
        to: toRaw ? businessDayEnd(toRaw) : undefined,
        itemType,
      });
      return res.json({ message: "OK", data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async create(req: Request, res: Response) {
    const {
      itemType,
      productId,
      supplyId,
      quantity,
      unitCost,
      supplier,
      purchasedAt,
      paymentMethodId,
    } = req.body as {
      itemType?: "product" | "supply";
      productId?: string;
      supplyId?: string;
      quantity?: number;
      unitCost?: number;
      supplier?: string;
      purchasedAt?: string;
      paymentMethodId?: string;
    };

    if (
      (itemType !== "product" && itemType !== "supply") ||
      quantity == null ||
      unitCost == null
    ) {
      return res.status(400).json({
        message:
          "Campos requeridos: itemType ('product'|'supply'), quantity, unitCost",
        data: null,
      });
    }
    if (
      typeof quantity !== "number" ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0 ||
      quantity > 1_000_000
    ) {
      return res.status(400).json({
        message: "La cantidad debe ser un entero positivo",
        data: null,
      });
    }
    if (
      typeof unitCost !== "number" ||
      !Number.isSafeInteger(unitCost) ||
      unitCost < 0
    ) {
      return res.status(400).json({
        message: "El costo unitario no puede ser negativo",
        data: null,
      });
    }

    if (
      (itemType === "product" && (!productId || supplyId)) ||
      (itemType === "supply" && (!supplyId || productId))
    ) {
      return res.status(400).json({
        message: "Debe enviarse exactamente el ítem correspondiente a itemType",
        data: null,
      });
    }

    if (purchasedAt) {
      const parsedDate = new Date(purchasedAt);
      if (Number.isNaN(parsedDate.getTime()) || parsedDate > new Date()) {
        return res.status(400).json({
          message: "La fecha de compra es inválida o futura",
          data: null,
        });
      }
    }

    try {
      const data = await PurchaseModel.create({
        itemType,
        productId,
        supplyId,
        quantity,
        unitCost,
        supplier,
        purchasedAt: purchasedAt ? new Date(purchasedAt) : undefined,
        paymentMethodId,
      });
      return res
        .status(201)
        .json({ message: "Compra registrada con éxito", data });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      return res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
}
