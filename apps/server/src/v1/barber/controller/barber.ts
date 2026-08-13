import type { Request, Response } from "express";
import AuthModel from "../../auth/model/auth";
import BarberModel from "../model/barber";

/** Normaliza el userId que manda el front ("" o "null" => sin vínculo). */
function cleanUserId(userId?: string): string | undefined {
  return userId && userId !== "null" ? userId : undefined;
}

export default class BarberController {
  /** Perfil de barbero del usuario logueado (o null si no está vinculado). */
  static async me(req: Request, res: Response) {
    try {
      const data = await BarberModel.getByUserId(req.user!.id);
      return res.json({ message: "OK", data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async getAll(req: Request, res: Response) {
    const includeInactive =
      req.query.all === "true" && req.user?.role === "admin";
    try {
      const data = await BarberModel.getAll({ includeInactive });
      return res.json({ message: "OK", data });
    } catch (err: any) {
      const message = err.message ?? "Error interno";
      return res.status(500).json({ message, data: null });
    }
  }

  static async getBySlug(req: Request, res: Response) {
    const { slug } = req.params;
    try {
      const data = await BarberModel.getBySlug(slug as string);
      if (!data) {
        return res
          .status(404)
          .json({ message: "Barbero no encontrado", data: null });
      }
      return res.json({ message: "OK", data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async create(req: Request, res: Response) {
    const { name, slug, bio, avatarUrl, experienceYears, userId } =
      req.body as {
        name?: string;
        slug?: string;
        bio?: string;
        avatarUrl?: string;
        experienceYears?: number;
        userId: string;
      };

    if (!name || !slug) {
      return res.status(400).json({
        message: "Campos requeridos: name, slug",
        data: null,
      });
    }

    // El slug debe ser URL-safe: solo minúsculas, números y guiones
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({
        message:
          "El slug solo puede contener letras minúsculas, números y guiones (ej: juan-perez)",
        data: null,
      });
    }

    const linkedUserId = cleanUserId(userId);

    try {
      const data = await BarberModel.create({
        name,
        slug,
        bio,
        avatarUrl,
        experienceYears,
        userId: linkedUserId,
      });
      // Vincular una cuenta a un barbero la promueve a rol 'barber'.
      if (linkedUserId) await AuthModel.promoteToBarber(linkedUserId);
      return res
        .status(201)
        .json({ message: "Barbero creado con éxito", data });
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

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, slug, bio, avatarUrl, experienceYears, isActive, userId } =
      req.body as {
        name?: string;
        slug?: string;
        bio?: string;
        avatarUrl?: string;
        experienceYears?: number;
        isActive?: boolean;
        userId?: string;
      };

    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = name;
    if (slug !== undefined) patch.slug = slug;
    if (bio !== undefined) patch.bio = bio;
    if (avatarUrl !== undefined) patch.avatarUrl = avatarUrl;
    if (experienceYears !== undefined) patch.experienceYears = experienceYears;
    if (isActive !== undefined) patch.isActive = isActive;
    const linkedUserId = cleanUserId(userId);
    if (userId !== undefined) patch.userId = linkedUserId ?? null;

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({
        message: "No se enviaron campos para actualizar",
        data: null,
      });
    }

    try {
      const data = await BarberModel.update(id as string, patch);
      if (!data) {
        return res
          .status(404)
          .json({ message: "Barbero no encontrado", data: null });
      }
      // Vincular una cuenta a un barbero la promueve a rol 'barber'.
      if (linkedUserId) await AuthModel.promoteToBarber(linkedUserId);
      return res.json({ message: "Barbero actualizado con éxito", data });
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
  /**
   * Reemplaza la grilla horaria completa de un barbero. El front manda la
   * semana entera (7 días con su flag isActive) y acá se valida y persiste de
   * una sola vez. Sustituye al flujo create/update por día, que dejaba
   * duplicados y no permitía guardar la desactivación de un día.
   */
  static async replaceSchedules(req: Request, res: Response) {
    const { id } = req.params;
    const { schedules } = req.body as {
      schedules?: {
        dayOfWeek?: number;
        startTime?: string;
        endTime?: string;
        startBreak?: string;
        endBreak?: string;
        isActive?: boolean;
        slotDurationMinutes?: number;
        appointmentMode: "appointment" | "walk_in";
      }[];
    };

    if (!Array.isArray(schedules)) {
      return res.status(400).json({
        message: "Se requiere un arreglo 'schedules'",
        data: null,
      });
    }

    // Solo validamos los días activos: son los únicos que se persisten.
    for (const s of schedules) {
      if (!s?.isActive) continue;
      if (
        typeof s.dayOfWeek !== "number" ||
        s.dayOfWeek < 0 ||
        s.dayOfWeek > 6 ||
        !s.startTime ||
        !s.endTime ||
        !s.startBreak ||
        !s.endBreak
      ) {
        return res.status(400).json({
          message:
            "Horario inválido: revisá el día (0-6) y los horarios de trabajo y descanso",
          data: null,
        });
      }
    }

    try {
      const barber = await BarberModel.getById(id as string);
      if (!barber) {
        return res
          .status(404)
          .json({ message: "Barbero no encontrado", data: null });
      }

      const data = await BarberModel.replaceSchedules(
        id as string,
        schedules as Parameters<typeof BarberModel.replaceSchedules>[1],
      );
      return res.json({ message: "Horarios guardados", data });
    } catch (err: any) {
      return res
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
      appointmentMode,
    } = req.body;

    if (
      !barberId ||
      !dayOfWeek ||
      !endTime ||
      !startTime ||
      !endBreak ||
      !startBreak ||
      !appointmentMode
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
        appointmentMode,
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
      appointmentMode,
    } = req.body;
    const id = req.params.id;

    if (
      !barberId ||
      !dayOfWeek ||
      !endTime ||
      !isActive ||
      !startTime ||
      !endBreak ||
      !startBreak ||
      !appointmentMode
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
        appointmentMode,
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
        return res
          .status(409)
          .json({ message: "El slug ya está en uso", data: null });
      }
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async remove(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const data = await BarberModel.remove(id as string);
      if (!data) {
        return res
          .status(404)
          .json({ message: "Barbero no encontrado", data: null });
      }
      return res.json({ message: "Barbero desactivado (soft-delete)", data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
}
