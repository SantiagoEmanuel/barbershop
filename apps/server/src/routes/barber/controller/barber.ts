import type { Request, Response } from "express";
import BarberModel from "../model/barber";

export default class BarberController {
  static async getAll(req: Request, res: Response): Promise<void> {
    const includeInactive =
      req.query.all === "true" && req.user?.role === "admin";
    try {
      const data = await BarberModel.getAll({ includeInactive });
      res.json({ message: "OK", data });
    } catch (err: any) {
      res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    try {
      const data = await BarberModel.getBySlug(slug as string);
      if (!data) {
        res.status(404).json({ message: "Barbero no encontrado", data: null });
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
    const { name, slug, bio, avatarUrl, experienceYears } = req.body as {
      name?: string;
      slug?: string;
      bio?: string;
      avatarUrl?: string;
      experienceYears?: number;
    };

    if (!name || !slug) {
      res.status(400).json({
        message: "Campos requeridos: name, slug",
        data: null,
      });
      return;
    }

    // El slug debe ser URL-safe: solo minúsculas, números y guiones
    if (!/^[a-z0-9-]+$/.test(slug)) {
      res.status(400).json({
        message:
          "El slug solo puede contener letras minúsculas, números y guiones (ej: juan-perez)",
        data: null,
      });
      return;
    }

    try {
      const data = await BarberModel.create({
        name,
        slug,
        bio,
        avatarUrl,
        experienceYears,
      });
      res.status(201).json({ message: "Barbero creado con éxito", data });
    } catch (err: any) {
      if (err.message?.includes("UNIQUE")) {
        res.status(409).json({ message: "El slug ya está en uso", data: null });
        return;
      }
      res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, slug, bio, avatarUrl, experienceYears, isActive } =
      req.body as {
        name?: string;
        slug?: string;
        bio?: string;
        avatarUrl?: string;
        experienceYears?: number;
        isActive?: boolean;
      };

    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = name;
    if (slug !== undefined) patch.slug = slug;
    if (bio !== undefined) patch.bio = bio;
    if (avatarUrl !== undefined) patch.avatarUrl = avatarUrl;
    if (experienceYears !== undefined) patch.experienceYears = experienceYears;
    if (isActive !== undefined) patch.isActive = isActive;

    if (Object.keys(patch).length === 0) {
      res.status(400).json({
        message: "No se enviaron campos para actualizar",
        data: null,
      });
      return;
    }

    try {
      const data = await BarberModel.update(id as string, patch);
      if (!data) {
        res.status(404).json({ message: "Barbero no encontrado", data: null });
        return;
      }
      res.json({ message: "Barbero actualizado con éxito", data });
    } catch (err: any) {
      if (err.message?.includes("UNIQUE")) {
        res.status(409).json({ message: "El slug ya está en uso", data: null });
        return;
      }
      res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
  static async createSchedule(req: Request, res: Response) {
    const {
      barberId,
      dayOfWeek,
      endTime,
      isActive,
      startTime,
      endBreak,
      startBreak,
    } = req.body;

    if (
      !barberId ||
      !dayOfWeek ||
      !endTime ||
      !isActive ||
      !startTime ||
      !endBreak ||
      !startBreak
    ) {
      return res.status(400).json({
        message: "Datos inválidos",
        data: null,
      });
    }

    try {
      const data = await BarberModel.createSchedule({
        barberId,
        dayOfWeek,
        endBreak,
        endTime,
        startBreak,
        startTime,
        isActive,
      });

      if (!data) {
        return res.status(404).json({
          message: "No se pudo guardar el horario",
          data: null,
        });
      }

      return res.status(201).json({
        message: "Horarios creados",
        data,
      });
    } catch (err: any) {
      if (err.message?.includes("UNIQUE")) {
        return res
          .status(409)
          .json({ message: "El slug ya está en uso", data: null });
      }
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
  static async updateSchedule(req: Request, res: Response) {
    const {
      barberId,
      dayOfWeek,
      endTime,
      isActive,
      startTime,
      endBreak,
      startBreak,
    } = req.body;
    const id = req.params.id;

    if (
      !barberId ||
      !dayOfWeek ||
      !endTime ||
      !isActive ||
      !startTime ||
      !endBreak ||
      !startBreak
    ) {
      return res.status(400).json({
        message: "Datos inválidos",
        data: null,
      });
    }

    try {
      const data = await BarberModel.updateSchedule(id as string, {
        barberId,
        dayOfWeek,
        endBreak,
        endTime,
        startBreak,
        startTime,
        isActive,
      });

      if (!data) {
        return res.status(404).json({
          message: "No se pudo actualizar el horario",
          data: null,
        });
      }

      return res.status(201).json({
        message: "Horarios actualizados",
        data,
      });
    } catch (err: any) {
      if (err.message?.includes("UNIQUE")) {
        res.status(409).json({ message: "El slug ya está en uso", data: null });
        return;
      }
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const data = await BarberModel.remove(id as string);
      if (!data) {
        res.status(404).json({ message: "Barbero no encontrado", data: null });
        return;
      }
      res.json({ message: "Barbero desactivado (soft-delete)", data });
    } catch (err: any) {
      res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
}
