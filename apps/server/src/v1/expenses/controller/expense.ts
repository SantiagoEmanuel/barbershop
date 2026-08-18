import {
  businessDayEnd,
  businessDayStart,
  isValidBusinessDate,
  todayISO,
} from "@config/utils";
import type { Request, Response } from "express";
import ExpenseModel from "../model/expense";

/** Parsea ?from y ?to (YYYY-MM-DD) a Date, o undefined si no vienen. */
function parseRange(req: Request) {
  const fromRaw = req.query.from as string | undefined;
  const toRaw = req.query.to as string | undefined;
  if (
    (fromRaw && !isValidBusinessDate(fromRaw)) ||
    (toRaw && !isValidBusinessDate(toRaw))
  ) {
    return null;
  }
  const from = fromRaw ? businessDayStart(fromRaw) : undefined;
  const to = toRaw ? businessDayEnd(toRaw) : undefined;
  return { from, to };
}

export default class ExpenseController {
  // ── Categorías ───────────────────────────────────────────────

  static async getCategories(_req: Request, res: Response) {
    try {
      const data = await ExpenseModel.getCategories();
      return res.json({ message: "OK", data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async createCategory(req: Request, res: Response) {
    const { name, kind } = req.body as {
      name?: string;
      kind?: "fixed" | "variable";
    };
    if (!name || (kind !== "fixed" && kind !== "variable")) {
      return res.status(400).json({
        message: "Campos requeridos: name, kind ('fixed' | 'variable')",
        data: null,
      });
    }
    try {
      const data = await ExpenseModel.createCategory(name, kind);
      return res.status(201).json({ message: "Rubro creado", data });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      return res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  // ── Gastos ───────────────────────────────────────────────────

  static async getAll(req: Request, res: Response) {
    const range = parseRange(req);
    if (!range) {
      return res
        .status(400)
        .json({ message: "Rango de fechas inválido", data: null });
    }
    const { from, to } = range;
    const categoryId = req.query.categoryId as string | undefined;
    try {
      const data = await ExpenseModel.getAll({ from, to, categoryId });
      return res.json({ message: "OK", data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async create(req: Request, res: Response) {
    const { categoryId, description, amount, incurredAt, paymentMethodId } =
      req.body as {
        categoryId?: string;
        description?: string;
        amount?: number;
        incurredAt?: string;
        paymentMethodId?: string;
      };

    if (!categoryId || !description || amount == null) {
      return res.status(400).json({
        message: "Campos requeridos: categoryId, description, amount",
        data: null,
      });
    }
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        message: "El monto debe ser un número positivo en centavos",
        data: null,
      });
    }

    try {
      const data = await ExpenseModel.create({
        categoryId,
        description,
        amount,
        incurredAt: incurredAt ? new Date(incurredAt) : undefined,
        paymentMethodId,
      });
      return res.status(201).json({ message: "Gasto registrado", data });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      return res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { categoryId, description, amount, incurredAt, paymentMethodId } =
      req.body as {
        categoryId?: string;
        description?: string;
        amount?: number;
        incurredAt?: string;
        paymentMethodId?: string;
      };

    const patch: Record<string, unknown> = {};
    if (categoryId !== undefined) patch.categoryId = categoryId;
    if (description !== undefined) patch.description = description;
    if (amount !== undefined) patch.amount = amount;
    if (incurredAt !== undefined) patch.incurredAt = new Date(incurredAt);
    if (paymentMethodId !== undefined) patch.paymentMethodId = paymentMethodId;

    try {
      const data = await ExpenseModel.update(id as string, patch);
      if (!data) {
        return res
          .status(404)
          .json({ message: "Gasto no encontrado", data: null });
      }
      return res.json({ message: "Gasto actualizado", data });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      return res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async remove(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const data = await ExpenseModel.remove(id as string);
      if (!data) {
        return res
          .status(404)
          .json({ message: "Gasto no encontrado", data: null });
      }
      return res.json({ message: "Gasto eliminado", data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  // ── Gastos fijos / recurrentes ───────────────────────────────

  static async getRecurring(_req: Request, res: Response) {
    try {
      const data = await ExpenseModel.getRecurring();
      return res.json({ message: "OK", data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async createRecurring(req: Request, res: Response) {
    const { categoryId, description, amount, dayOfMonth } = req.body as {
      categoryId?: string;
      description?: string;
      amount?: number;
      dayOfMonth?: number;
    };

    if (!categoryId || !description || amount == null) {
      return res.status(400).json({
        message: "Campos requeridos: categoryId, description, amount",
        data: null,
      });
    }
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        message: "El monto debe ser un número positivo en centavos",
        data: null,
      });
    }

    try {
      const data = await ExpenseModel.createRecurring({
        categoryId,
        description,
        amount,
        dayOfMonth,
      });
      return res.status(201).json({ message: "Gasto fijo creado", data });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      return res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async updateRecurring(req: Request, res: Response) {
    const { id } = req.params;
    const { categoryId, description, amount, dayOfMonth, isActive } =
      req.body as {
        categoryId?: string;
        description?: string;
        amount?: number;
        dayOfMonth?: number;
        isActive?: boolean;
      };

    const patch: Record<string, unknown> = {};
    if (categoryId !== undefined) patch.categoryId = categoryId;
    if (description !== undefined) patch.description = description;
    if (amount !== undefined) patch.amount = amount;
    if (dayOfMonth !== undefined) patch.dayOfMonth = dayOfMonth;
    if (isActive !== undefined) patch.isActive = isActive;

    try {
      const data = await ExpenseModel.updateRecurring(id as string, patch);
      if (!data) {
        return res
          .status(404)
          .json({ message: "Gasto fijo no encontrado", data: null });
      }
      return res.json({ message: "Gasto fijo actualizado", data });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      return res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async removeRecurring(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const data = await ExpenseModel.removeRecurring(id as string);
      if (!data) {
        return res
          .status(404)
          .json({ message: "Gasto fijo no encontrado", data: null });
      }
      return res.json({ message: "Gasto fijo desactivado", data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async runRecurring(req: Request, res: Response) {
    const month =
      (req.query.month as string | undefined) ?? todayISO().slice(0, 7);
    try {
      const data = await ExpenseModel.runRecurring(month);
      return res.json({
        message: `Gastos fijos materializados: ${data.length}`,
        data,
      });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      return res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
}
