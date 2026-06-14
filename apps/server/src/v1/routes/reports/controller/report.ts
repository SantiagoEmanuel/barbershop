import type { Request, Response } from "express";
import ReportModel from "../model/report";

/**
 * Resuelve el rango de fechas desde ?from&to (YYYY-MM-DD).
 * Default: mes calendario actual.
 */
function resolveRange(req: Request) {
  const fromRaw = req.query.from as string | undefined;
  const toRaw = req.query.to as string | undefined;

  const now = new Date();
  const defaultFrom = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const defaultTo = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  );

  const from = fromRaw ? new Date(`${fromRaw}T00:00:00.000Z`) : defaultFrom;
  const to = toRaw ? new Date(`${toRaw}T23:59:59.999Z`) : defaultTo;

  return { from, to };
}

function handler(fn: (range: { from: Date; to: Date }) => Promise<unknown>) {
  return async (req: Request, res: Response) => {
    const range = resolveRange(req);
    if (isNaN(range.from.getTime()) || isNaN(range.to.getTime())) {
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
