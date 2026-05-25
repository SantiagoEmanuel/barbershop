import type { Request, Response } from "express";
import ProductModel from "../model/product";

export default class ProductController {
  static async getAll(req: Request, res: Response) {
    const includeInactive =
      req.query.all === "true" && req.user?.role === "admin";
    try {
      const data = await ProductModel.getAll({ includeInactive });
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
      const data = await ProductModel.getById(id as string);
      if (!data) {
        return res
          .status(404)
          .json({ message: "Producto no encontrado", data: null });
      }
      return res.json({ message: "OK", data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async create(req: Request, res: Response) {
    const { name, description, price, stock } = req.body as {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
    };

    if (!name || price == null || stock == null) {
      return res.status(400).json({
        message: "Campos requeridos: name, price, stock",
        data: null,
      });
    }

    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({
        message: "El precio debe ser un número positivo en centavos",
        data: null,
      });
    }

    if (typeof stock !== "number" || stock < 0) {
      return res.status(400).json({
        message: "El stock no puede ser negativo",
        data: null,
      });
    }

    try {
      const data = await ProductModel.create({
        name,
        description,
        price,
        stock,
      });
      return res
        .status(201)
        .json({ message: "Producto creado con éxito", data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, description, price, stock, isActive } = req.body as {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      isActive?: boolean;
    };

    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = name;
    if (description !== undefined) patch.description = description;
    if (price !== undefined) patch.price = price;
    if (stock !== undefined) patch.stock = stock;
    if (isActive !== undefined) patch.isActive = isActive;

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({
        message: "No se enviaron campos para actualizar",
        data: null,
      });
    }

    try {
      const data = await ProductModel.update(id as string, patch);
      if (!data) {
        return res
          .status(404)
          .json({ message: "Producto no encontrado", data: null });
      }
      return res.json({ message: "Producto actualizado con éxito", data });
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
      const data = await ProductModel.remove(id as string);
      if (!data) {
        return res
          .status(404)
          .json({ message: "Producto no encontrado", data: null });
      }
      return res.json({ message: "Producto desactivado (soft-delete)", data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async createSale(req: Request, res: Response) {
    const { id } = req.params;
    const { orderId, soldBy, quantity, priceSnapshot } = req.body as {
      orderId?: string;
      soldBy?: string;
      quantity?: number;
      priceSnapshot?: number;
    };

    if (!orderId || !soldBy || quantity == null || priceSnapshot == null) {
      return res.status(400).json({
        message: "Campos requeridos: orderId, soldBy, quantity, priceSnapshot",
        data: null,
      });
    }

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        message: "La cantidad debe ser un entero positivo",
        data: null,
      });
    }

    if (typeof priceSnapshot !== "number" || priceSnapshot <= 0) {
      return res.status(400).json({
        message: "El precio debe ser un número positivo en centavos",
        data: null,
      });
    }

    try {
      const data = await ProductModel.createSale(id as string, {
        orderId,
        soldBy,
        quantity,
        priceSnapshot,
      });
      return res
        .status(201)
        .json({ message: "Venta de producto registrada", data });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      return res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
}
