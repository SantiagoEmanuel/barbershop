import { isValidBusinessDate, todayISO } from "@config/utils";
import type { Request, Response } from "express";
import OrderModel, { type CounterSaleItem } from "../model/order";

const VALID_STATUSES = ["pending", "paid", "refunded", "failed"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

export default class OrderController {
  static async getOrders(req: Request, res: Response) {
    const rawDate = req.query.date as string | undefined;
    const date = rawDate ?? todayISO();

    if (!isValidBusinessDate(date)) {
      return res.status(400).json({
        message: "Formato de fecha inválido. Usar: YYYY-MM-DD",
        data: null,
      });
    }

    try {
      const data = await OrderModel.getByDate(date);
      return res.json({ message: "OK", data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async getAll(_req: Request, res: Response) {
    try {
      const data = await OrderModel.getAll();
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
      const data = await OrderModel.getById(id as string);
      if (!data) {
        return res
          .status(404)
          .json({ message: "Orden no encontrada", data: null });
      }
      return res.json({ message: "OK", data });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async create(req: Request, res: Response) {
    const { appointmentId, overbookedAppointmentId, paymentMethodId, amount } =
      req.body as {
        appointmentId?: string;
        overbookedAppointmentId?: string;
        paymentMethodId?: string;
        amount?: number;
      };

    if (!paymentMethodId || amount == null) {
      return res.status(400).json({
        message: "Campos requeridos: paymentMethodId, amount",
        data: null,
      });
    }

    if (
      typeof amount !== "number" ||
      !Number.isSafeInteger(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        message: "El monto debe ser un número positivo en centavos",
        data: null,
      });
    }

    try {
      const data = await OrderModel.create({
        appointmentId,
        overbookedAppointmentId,
        paymentMethodId,
        amount,
      });
      return res
        .status(201)
        .json({ message: "Orden generada con éxito", data });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      return res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  /**
   * Venta de mostrador hecha por un barbero: crea la orden y registra
   * las ventas de cada producto del carrito ligadas a la orden recién creada.
   * Los items con kind === "service" no se persisten individualmente:
   * sólo suman al `amount` total (si existe un appointmentId, queda como
   * referencia de la sesión).
   */
  static async createByBarber(req: Request, res: Response) {
    const {
      amount,
      soldBy,
      items,
      paymentMethodId,
      appointmentId,
      overbookedAppointmentId,
    } = req.body as {
      amount?: number;
      soldBy?: string;
      items?: CounterSaleItem[];
      paymentMethodId?: string;
      appointmentId?: string;
      overbookedAppointmentId?: string;
    };

    // 1. Validación de presencia (ojo con los `!` que se te habían escapado)
    if (
      amount == null ||
      !soldBy ||
      !paymentMethodId ||
      !Array.isArray(items)
    ) {
      return res.status(400).json({
        message: "Campos requeridos: amount, soldBy, paymentMethodId, items[]",
        data: null,
      });
    }

    // 2. Validación de tipos
    if (
      typeof amount !== "number" ||
      !Number.isSafeInteger(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        message: "El monto debe ser un número positivo en centavos",
        data: null,
      });
    }

    // 3. Validación básica de cada item
    for (const it of items) {
      if (
        !it ||
        (it.kind !== "product" && it.kind !== "service") ||
        !it.id ||
        typeof it.quantity !== "number" ||
        !Number.isInteger(it.quantity) ||
        it.quantity <= 0
      ) {
        return res.status(400).json({
          message: "Items inválidos: revisar kind, id y quantity",
          data: null,
        });
      }
    }

    try {
      // 4. Crear la orden. Una venta de mostrador / cierre de servicio se
      //    cobra en el acto, así que queda registrada como pagada: de lo
      //    contrario no se reflejaría en los reportes de ingresos (que solo
      //    consideran órdenes con status "paid").
      const order = await OrderModel.createPaidCounterSale({
        appointmentId,
        overbookedAppointmentId,
        paymentMethodId,
        amount,
        soldBy,
        items,
        sellerUserId: req.user?.role === "barber" ? req.user.id : undefined,
      });

      // 6. Devolver la orden con sus relaciones (paymentMethod / appointment)
      //    para que el front pueda agregarla al listado sin re-fetchear.
      const fullOrder = await OrderModel.getById(order.id);

      return res
        .status(201)
        .json({ message: "Venta registrada con éxito", data: fullOrder });
    } catch (err: any) {
      const httpStatus = typeof err.status === "number" ? err.status : 500;
      return res
        .status(httpStatus)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { paymentMethodId, status } = req.body as {
      paymentMethodId?: string;
      status?: OrderStatus;
    };

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status inválido. Valores permitidos: ${VALID_STATUSES.join(", ")}`,
        data: null,
      });
    }

    const patch: Record<string, unknown> = {};
    if (paymentMethodId !== undefined) patch.paymentMethodId = paymentMethodId;
    if (status !== undefined) patch.status = status;

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({
        message: "No se enviaron campos para actualizar",
        data: null,
      });
    }

    try {
      const data = await OrderModel.update(id as string, patch as any);
      if (!data) {
        return res
          .status(404)
          .json({ message: "Orden no encontrada", data: null });
      }
      return res.json({ message: "Orden actualizada con éxito", data });
    } catch (err: any) {
      const httpStatus = typeof err.status === "number" ? err.status : 500;
      return res
        .status(httpStatus)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
}
