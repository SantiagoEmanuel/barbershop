import type { Request, Response } from "express";
import AvailabilityModel from "../model/availability";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default class AvailabilityController {
  static async getSlots(req: Request, res: Response) {
    const { barberId, date } = req.query;

    if (!barberId || !date) {
      return res.status(400).json({
        message: "Los query params 'barberId' y 'date' son requeridos",
        data: null,
      });
    }

    if (!DATE_REGEX.test(date as string)) {
      return res.status(400).json({
        message: "El formato de 'date' debe ser YYYY-MM-DD",
        data: null,
      });
    }

    try {
      const slots = await AvailabilityModel.getSlots(
        barberId as string,
        date as string,
      );
      return res.json({ message: "OK", data: { slots } });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
}
