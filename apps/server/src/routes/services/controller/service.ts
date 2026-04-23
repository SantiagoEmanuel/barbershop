import type { Request, Response } from "express";
import ServiceModel from "../model/service";

export default class ServiceController {
  static async getAll(req: Request, res: Response): Promise<void> {
    const includeInactive =
      req.query.all === "true" && req.user?.role === "admin";
    try {
      const data = await ServiceModel.getAll({ includeInactive });
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
      const data = await ServiceModel.getById(id as string);
      if (!data) {
        res.status(404).json({ message: "Servicio no encontrado", data: null });
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
    const { name, description, price, durationMinutes } = req.body as {
      name?: string;
      description?: string;
      price?: number;
      durationMinutes?: number;
    };

    if (!name || price == null || durationMinutes == null) {
      res.status(400).json({
        message: "Campos requeridos: name, price, durationMinutes",
        data: null,
      });
      return;
    }

    if (typeof price !== "number" || price <= 0) {
      res.status(400).json({
        message:
          "El precio debe ser un número positivo en centavos (ej: $5.000 ARS = 500000)",
        data: null,
      });
      return;
    }

    if (typeof durationMinutes !== "number" || durationMinutes <= 0) {
      res.status(400).json({
        message: "La duración debe ser un número positivo en minutos",
        data: null,
      });
      return;
    }

    try {
      const data = await ServiceModel.create({
        name,
        description,
        price,
        durationMinutes,
      });
      res.status(201).json({ message: "Servicio creado con éxito", data });
    } catch (err: any) {
      if (err.message?.includes("UNIQUE")) {
        res.status(409).json({
          message: "Ya existe un servicio con ese nombre",
          data: null,
        });
        return;
      }
      res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, description, price, durationMinutes, isActive } =
      req.body as {
        name?: string;
        description?: string;
        price?: number;
        durationMinutes?: number;
        isActive?: boolean;
      };

    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = name;
    if (description !== undefined) patch.description = description;
    if (price !== undefined) patch.price = price;
    if (durationMinutes !== undefined) patch.durationMinutes = durationMinutes;
    if (isActive !== undefined) patch.isActive = isActive;

    if (Object.keys(patch).length === 0) {
      res.status(400).json({
        message: "No se enviaron campos para actualizar",
        data: null,
      });
      return;
    }

    try {
      const data = await ServiceModel.update(id as string, patch);
      if (!data) {
        res.status(404).json({ message: "Servicio no encontrado", data: null });
        return;
      }
      res.json({ message: "Servicio actualizado con éxito", data });
    } catch (err: any) {
      if (err.message?.includes("UNIQUE")) {
        res.status(409).json({
          message: "Ya existe un servicio con ese nombre",
          data: null,
        });
        return;
      }
      res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const data = await ServiceModel.remove(id as string);
      if (!data) {
        res.status(404).json({ message: "Servicio no encontrado", data: null });
        return;
      }
      res.json({ message: "Servicio desactivado (soft-delete)", data });
    } catch (err: any) {
      res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
}
