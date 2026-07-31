import type { Request, Response } from "express";
import SupplyModel from "../model/supply";

export default class SupplyController {
  static async getAll(req: Request, res: Response) {
    const includeInactive =
      req.query.all === "true" && req.user?.role === "admin";
    try {
      const data = await SupplyModel.getAll({ includeInactive });
      return res.json({ message: "OK", data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const data = await SupplyModel.getById(id as string);
      if (!data) {
        return res
          .status(404)
          .json({ message: "Insumo no encontrado", data: null });
      }
      return res.json({ message: "OK", data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async create(req: Request, res: Response) {
    const { name, description, unit, cost, stock, lowStockThreshold } =
      req.body as {
        name?: string;
        description?: string;
        unit?: string;
        cost?: number;
        stock?: number;
        lowStockThreshold?: number;
      };

    if (!name || stock == null) {
      return res.status(400).json({
        message: "Campos requeridos: name, stock",
        data: null,
      });
    }

    if (typeof stock !== "number" || stock < 0) {
      return res
        .status(400)
        .json({ message: "El stock no puede ser negativo", data: null });
    }

    if (cost != null && (typeof cost !== "number" || cost < 0)) {
      return res
        .status(400)
        .json({ message: "El costo no puede ser negativo", data: null });
    }

    try {
      const data = await SupplyModel.create({
        name,
        description,
        unit,
        cost,
        stock,
        lowStockThreshold,
      });
      return res.status(201).json({ message: "Insumo creado con éxito", data });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      return res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const {
      name,
      description,
      unit,
      cost,
      stock,
      lowStockThreshold,
      isActive,
    } = req.body as {
      name?: string;
      description?: string;
      unit?: string;
      cost?: number;
      stock?: number;
      lowStockThreshold?: number;
      isActive?: boolean;
    };

    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = name;
    if (description !== undefined) patch.description = description;
    if (unit !== undefined) patch.unit = unit;
    if (cost !== undefined) patch.cost = cost;
    if (stock !== undefined) patch.stock = stock;
    if (lowStockThreshold !== undefined)
      patch.lowStockThreshold = lowStockThreshold;
    if (isActive !== undefined) patch.isActive = isActive;

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({
        message: "No se enviaron campos para actualizar",
        data: null,
      });
    }

    try {
      const data = await SupplyModel.update(id as string, patch);
      if (!data) {
        return res
          .status(404)
          .json({ message: "Insumo no encontrado", data: null });
      }
      return res.json({ message: "Insumo actualizado con éxito", data });
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
      const data = await SupplyModel.remove(id as string);
      if (!data) {
        return res
          .status(404)
          .json({ message: "Insumo no encontrado", data: null });
      }
      return res.json({ message: "Insumo desactivado (soft-delete)", data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
}
