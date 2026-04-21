import { Request, Response } from "express";
import OrderModel, { type Order } from "../model/order";

export default class OrderController {
  static async createOrder(req: Request, res: Response) {
    const { serviceId, shiftId, paymentMethodId, email } = req.body;

    if (!serviceId || !shiftId || !paymentMethodId || email) {
      return res.status(400).json({
        message: "No se pudo generar la orden",
        data: null,
      });
    }

    try {
      const data = await OrderModel.generate({
        serviceId,
        shiftId,
        paymentMethodId,
        email,
      });

      if (!data) {
        return res.status(500).json({
          message: "No se pudo generar la orden",
          data: null,
        });
      }

      return res.status(201).json({
        message: "Orden generada con éxito",
        data: data,
      });
    } catch (err: any) {
      return res.status(400).json({
        message: err.message || "No se pudo generar la orden",
        data: null,
      });
    }
  }
  static async updateOrder(req: Request, res: Response) {
    const id = req.params.id as string;
    const data: Order = req.body;

    if (!id || !data) {
      return res.status(400).json({
        message: "No se pudo actualizar la orden",
        data: null,
      });
    }

    try {
      const dataUpdate = await OrderModel.update({ id, data });

      if (!dataUpdate) {
        return res.status(500).json({
          message: "No se pudo actualizar la orden",
          data: null,
        });
      }

      return res.status(201).json({
        message: "Se actualizó con éxito tu orden",
        data: dataUpdate,
      });
    } catch (err: any) {
      return res.status(400).json({
        message: err.message || "No se pudo actualizar la orden",
        data: null,
      });
    }
  }
  static async getOrders(req: Request, res: Response) {
    const date = (req.query.date || new Date()) as Date;
    try {
      const data = OrderModel.get({ date });

      return res.status(200).json({
        message: "OK",
        data,
      });
    } catch (err: any) {
      return res.status(500).json({
        message: err.message || "No se pudo obtener las ordenes",
      });
    }
  }
}
