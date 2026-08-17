import { db } from "@/db/db";
import { expenses, productSales } from "@/db/turso/schema";
import { businessDate } from "@config/utils";
import { and, eq, gte, lte } from "drizzle-orm";

interface Range {
  from: Date;
  to: Date;
}

/** 'YYYY-MM-DD' en la zona operativa, para agrupar series por día. */
function dayKey(d: Date): string {
  return businessDate(d);
}

export default class ReportModel {
  /** Órdenes pagas dentro del rango (fecha = paidAt ?? createdAt). */
  private static async paidOrdersInRange({ from, to }: Range) {
    const orders = await db.query.orders.findMany({
      where: (o) => eq(o.status, "paid"),
      with: {
        appointment: { with: { service: true, barber: true } },
        overbookedAppointment: { with: { service: true, barber: true } },
        paymentMethod: true,
        productSales: { with: { product: true } },
      },
      orderBy: (o, { desc }) => [desc(o.createdAt)],
    });

    return orders.filter((o) => {
      const d = o.paidAt ?? o.createdAt;
      return d >= from && d <= to;
    });
  }

  // ── Balance general ──────────────────────────────────────────

  static async summary(range: Range) {
    const orders = await this.paidOrdersInRange(range);
    const expenseRows = await db.query.expenses.findMany({
      where: and(
        gte(expenses.incurredAt, range.from),
        lte(expenses.incurredAt, range.to),
      ),
      with: { category: true },
    });

    const income = orders.reduce((s, o) => s + o.amount, 0);
    const totalExpenses = expenseRows.reduce((s, e) => s + e.amount, 0);
    const extraordinaryOrdersCount = orders.filter(
      (o) => o.overbookedAppointmentId !== null,
    ).length;

    // Ingresos: productos vs servicios.
    let productIncome = 0;
    for (const o of orders) {
      for (const ps of o.productSales) {
        productIncome += ps.priceSnapshot * ps.quantity;
      }
    }
    const serviceIncome = income - productIncome;

    // Ingresos por método de pago.
    const byMethodMap = new Map<string, number>();
    for (const o of orders) {
      const name = o.paymentMethod?.name ?? "Sin método";
      byMethodMap.set(name, (byMethodMap.get(name) ?? 0) + o.amount);
    }

    // Egresos por rubro y por tipo (fijo/variable).
    const byCategoryMap = new Map<string, number>();
    let fixed = 0;
    let variable = 0;
    for (const e of expenseRows) {
      const name = e.category?.name ?? "Otros";
      byCategoryMap.set(name, (byCategoryMap.get(name) ?? 0) + e.amount);
      if (e.category?.kind === "fixed") fixed += e.amount;
      else variable += e.amount;
    }

    return {
      income,
      expenses: totalExpenses,
      balance: income - totalExpenses,
      ordersCount: orders.length,
      extraordinaryOrdersCount,
      incomeBreakdown: {
        services: serviceIncome,
        products: productIncome,
        byMethod: [...byMethodMap.entries()].map(([name, amount]) => ({
          name,
          amount,
        })),
      },
      expenseBreakdown: {
        fixed,
        variable,
        byCategory: [...byCategoryMap.entries()].map(([name, amount]) => ({
          name,
          amount,
        })),
      },
    };
  }

  // ── Detalle de ingresos ──────────────────────────────────────

  static async income(range: Range) {
    const orders = await this.paidOrdersInRange(range);

    const byDayMap = new Map<string, number>();
    for (const o of orders) {
      const key = dayKey(o.paidAt ?? o.createdAt);
      byDayMap.set(key, (byDayMap.get(key) ?? 0) + o.amount);
    }

    const total = orders.reduce((s, o) => s + o.amount, 0);

    return {
      total,
      count: orders.length,
      averageTicket: orders.length ? Math.round(total / orders.length) : 0,
      byDay: [...byDayMap.entries()]
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      orders: orders.map((o) => ({
        id: o.id,
        amount: o.amount,
        paidAt: o.paidAt ?? o.createdAt,
        paymentMethod: o.paymentMethod?.name ?? null,
        service:
          o.appointment?.service?.name ??
          o.overbookedAppointment?.service?.name ??
          null,
        barber:
          o.appointment?.barber?.name ??
          o.overbookedAppointment?.barber?.name ??
          null,
        appointmentKind: o.overbookedAppointmentId
          ? "extraordinary"
          : o.appointmentId
            ? "regular"
            : null,
        productsCount: o.productSales.reduce((s, ps) => s + ps.quantity, 0),
      })),
    };
  }

  // ── Detalle de egresos ───────────────────────────────────────

  static async expenses(range: Range) {
    const rows = await db.query.expenses.findMany({
      where: and(
        gte(expenses.incurredAt, range.from),
        lte(expenses.incurredAt, range.to),
      ),
      with: { category: true, paymentMethod: true },
      orderBy: (e, { desc }) => [desc(e.incurredAt)],
    });

    const byDayMap = new Map<string, number>();
    const byCategoryMap = new Map<string, number>();
    let fixed = 0;
    let variable = 0;
    for (const e of rows) {
      const dk = dayKey(e.incurredAt);
      byDayMap.set(dk, (byDayMap.get(dk) ?? 0) + e.amount);
      const cat = e.category?.name ?? "Otros";
      byCategoryMap.set(cat, (byCategoryMap.get(cat) ?? 0) + e.amount);
      if (e.category?.kind === "fixed") fixed += e.amount;
      else variable += e.amount;
    }

    const total = rows.reduce((s, e) => s + e.amount, 0);

    return {
      total,
      count: rows.length,
      fixed,
      variable,
      byDay: [...byDayMap.entries()]
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      byCategory: [...byCategoryMap.entries()]
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount),
      expenses: rows.map((e) => ({
        id: e.id,
        description: e.description,
        amount: e.amount,
        incurredAt: e.incurredAt,
        category: e.category?.name ?? null,
        kind: e.category?.kind ?? null,
        paymentMethod: e.paymentMethod?.name ?? null,
      })),
    };
  }

  // ── Rentabilidad de productos ────────────────────────────────

  static async products(range: Range) {
    const sales = await db.query.productSales.findMany({
      where: and(
        gte(productSales.soldAt, range.from),
        lte(productSales.soldAt, range.to),
      ),
      with: { product: true },
    });

    const map = new Map<
      string,
      { name: string; qtySold: number; revenue: number; cogs: number }
    >();
    for (const s of sales) {
      const key = s.productId;
      const entry = map.get(key) ?? {
        name: s.product?.name ?? "—",
        qtySold: 0,
        revenue: 0,
        cogs: 0,
      };
      entry.qtySold += s.quantity;
      entry.revenue += s.priceSnapshot * s.quantity;
      entry.cogs += s.costSnapshot * s.quantity;
      map.set(key, entry);
    }

    return [...map.entries()]
      .map(([id, e]) => {
        const profit = e.revenue - e.cogs;
        return {
          id,
          name: e.name,
          qtySold: e.qtySold,
          revenue: e.revenue,
          cogs: e.cogs,
          profit,
          marginPct: e.revenue
            ? Math.round((profit / e.revenue) * 1000) / 10
            : 0,
        };
      })
      .sort((a, b) => b.profit - a.profit);
  }

  // ── Rendimiento de servicios (solo ingresos / demanda) ───────

  static async services(range: Range) {
    const fromKey = dayKey(range.from);
    const toKey = dayKey(range.to);

    const appts = await db.query.appointments.findMany({
      where: (a) => eq(a.status, "completed"),
      with: { service: true },
    });

    const inRange = appts.filter((a) => a.date >= fromKey && a.date <= toKey);

    const map = new Map<
      string,
      { name: string; qty: number; revenue: number }
    >();
    for (const a of inRange) {
      const key = a.serviceId;
      const entry = map.get(key) ?? {
        name: a.service?.name ?? "—",
        qty: 0,
        revenue: 0,
      };
      entry.qty += 1;
      entry.revenue += a.priceSnapshot;
      map.set(key, entry);
    }

    return [...map.entries()]
      .map(([id, e]) => ({
        id,
        name: e.name,
        qty: e.qty,
        revenue: e.revenue,
        averageTicket: e.qty ? Math.round(e.revenue / e.qty) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }
}
