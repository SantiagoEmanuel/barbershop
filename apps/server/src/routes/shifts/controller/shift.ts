import { Request, Response } from "express";
import ShiftModel from "../model/shift";

export default class ShiftController {
  static async generateShift(req: Request, res: Response) {
    const { scheduleId, barberId } = req.body;

    if (!scheduleId || !barberId) {
      return res.status(400).json({
        message: "Error al generar la reserva",
        data: null,
      });
    }

    try {
      const data = await ShiftModel.registerShift({ scheduleId, barberId });

      return res.status(201).json({
        message: "Tu reserva se guardó correctamente",
        data,
      });
    } catch (err: any) {
      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  }
  static async updateShift(req: Request, res: Response) {
    const shiftId = req.params.id as string;
    const { scheduleId, barberId } = req.body;

    if (!shiftId || !scheduleId || !barberId) {
      return res.status(304).json({
        message: "Error al actualizar tu reserva",
        data: null,
      });
    }

    const shiftExist = await ShiftModel.verifyShift({ shiftId });

    if (!shiftExist) {
      return res.status(400).json({
        message: "Error al actualizar tu reserva",
        data: null,
      });
    }

    try {
      const data = await ShiftModel.updateShift({
        shiftId,
        scheduleId,
        barberId,
      });

      if (!data) {
        return res.status(304).json({
          message: "Error al actualizar tu reserva",
          data: null,
        });
      }

      return res.status(201).json({
        message: "Tu reserva se actualizó correctamente",
        data,
      });
    } catch (err: any) {
      return res.status(304).json({
        message: err.message,
      });
    }
  }
  static async cancelledShift(req: Request, res: Response) {
    const shiftId = req.params.id as string;

    if (!shiftId) {
      return res.status(304).json({
        message: "Error al cancelar tu reserva",
        data: null,
      });
    }

    const shiftExist = await ShiftModel.verifyShift({ shiftId });

    if (!shiftExist) {
      return res.status(400).json({
        message: "Error al cancelar tu reserva",
        data: null,
      });
    }

    try {
      const data = await ShiftModel.cancelShift({ shiftId });

      if (!data || !data.isCancelled) {
        return res.status(304).json({
          message: "Error al cancelar tu reserva",
          data: null,
        });
      }

      return res.json({
        message: "Tu reserva se canceló exitosamente",
        data: data,
      });
    } catch (err: any) {
      return res.status(304).json({
        message: err.message,
        data: null,
      });
    }
  }
}
