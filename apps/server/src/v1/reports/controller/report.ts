import {
  businessDayEnd,
  businessDayStart,
  businessMonthRange,
  isValidBusinessDate,
} from "@config/utils";
import type { Request, Response } from "express";
import ReportModel from "../model/report";

/**
 * Resuelve el rango de fechas desde ?from&to (YYYY-MM-DD).
 * Default: mes calendario actual.
 */
function resolveRange(req: Request) {
  const fromRaw = req.query.from as string | undefined;
  const toRaw = req.query.to as string | undefined;

  if (
    (fromRaw && !isValidBusinessDate(fromRaw)) ||
    (toRaw && !isValidBusinessDate(toRaw))
  ) {
    return null;
  }

  const defaults = businessMonthRange();
  const from = fromRaw ? businessDayStart(fromRaw) : defaults.from;
  const to = toRaw ? businessDayEnd(toRaw) : defaults.to;

  return { from, to };
}

function handler(fn: (range: { from: Date; to: Date }) => Promise<unknown>) {
  return async (req: Request, res: Response) => {
    const range = resolveRange(req);
    if (!range) {
      return res
        .status(400)
        .json({ message: "Rango de fechas inválido", data: null });
    }
    try {
      const data = await fn(range);
      return res.json({ message: "OK", data });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      return res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  };
}

export default class ReportController {
  static summary = handler((r) => ReportModel.summary(r));
  static income = handler((r) => ReportModel.income(r));
  static expenses = handler((r) => ReportModel.expenses(r));
  static products = handler((r) => ReportModel.products(r));
  static services = handler((r) => ReportModel.services(r));
}
