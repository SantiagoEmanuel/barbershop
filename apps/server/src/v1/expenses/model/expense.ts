import { db, type DbOrTx } from "@/db/db";
import {
  expenseCategories,
  expenses,
  paymentMethods,
  recurringExpenses,
} from "@/db/turso/schema";
import AppError from "@/utils/AppError";
import { businessDayStart } from "@config/utils";
import { and, eq, gte, lte } from "drizzle-orm";

type ExpenseKind = "fixed" | "variable";

interface RangeFilter {
  from?: Date;
  to?: Date;
}

interface CreateExpenseData {
  categoryId: string;
  description: string;
  amount: number;
  incurredAt?: Date;
  paymentMethodId?: string;
  purchaseId?: string;
  recurringExpenseId?: string;
}

interface CreateRecurringData {
  categoryId: string;
  description: string;
  amount: number;
  dayOfMonth?: number;
}

/** Categorías por defecto, creadas la primera vez que se listan. */
const DEFAULT_CATEGORIES: { name: string; kind: ExpenseKind }[] = [
  { name: "Alquiler", kind: "fixed" },
  { name: "Luz", kind: "fixed" },
  { name: "Agua", kind: "fixed" },
  { name: "Internet", kind: "fixed" },
  { name: "Sueldos", kind: "fixed" },
  { name: "Productos", kind: "variable" },
  { name: "Insumos", kind: "variable" },
  { name: "Otros", kind: "variable" },
];

export default class ExpenseModel {
  // ── Categorías ───────────────────────────────────────────────

  static async getCategories({ includeInactive = false } = {}) {
    const existing = await db.query.expenseCategories.findMany();
    if (existing.length === 0) {
      await db.insert(expenseCategories).values(DEFAULT_CATEGORIES);
    }
    return db.query.expenseCategories.findMany({
      where: includeInactive ? undefined : eq(expenseCategories.isActive, true),
      orderBy: (c, { asc }) => [asc(c.kind), asc(c.name)],
    });
  }

  static async createCategory(name: string, kind: ExpenseKind) {
    try {
      const [created] = await db
        .insert(expenseCategories)
        .values({ name, kind })
        .returning();
      if (!created) throw new AppError("No se pudo crear el rubro", 500);
      return created;
    } catch (err: any) {
      if (err.message?.includes("UNIQUE")) {
        throw new AppError("Ya existe un rubro con ese nombre", 409);
      }
      throw err;
    }
  }

  /** Devuelve la categoría con ese nombre, creándola si no existe. */
  static async ensureCategory(name: string, kind: ExpenseKind) {
    const found = await db.query.expenseCategories.findFirst({
      where: eq(expenseCategories.name, name),
    });
    if (found) return found;
    return this.createCategory(name, kind);
  }

  // ── Gastos (egresos) ─────────────────────────────────────────

  static async getAll(filter: RangeFilter & { categoryId?: string } = {}) {
    const conditions = [];
    if (filter.from) conditions.push(gte(expenses.incurredAt, filter.from));
    if (filter.to) conditions.push(lte(expenses.incurredAt, filter.to));
    if (filter.categoryId)
      conditions.push(eq(expenses.categoryId, filter.categoryId));

    return db.query.expenses.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      with: { category: true, paymentMethod: true, purchase: true },
      orderBy: (e, { desc }) => [desc(e.incurredAt)],
    });
  }

  static async create(data: CreateExpenseData, tx: DbOrTx = db) {
    if (!Number.isSafeInteger(data.amount) || data.amount <= 0) {
      throw new AppError(
        "El monto debe ser un entero positivo en centavos",
        400,
      );
    }

    const category = await tx.query.expenseCategories.findFirst({
      where: and(
        eq(expenseCategories.id, data.categoryId),
        eq(expenseCategories.isActive, true),
      ),
    });
    if (!category) throw new AppError("Rubro de gasto inválido", 400);

    if (data.paymentMethodId) {
      const paymentMethod = await tx.query.paymentMethods.findFirst({
        where: and(
          eq(paymentMethods.id, data.paymentMethodId),
          eq(paymentMethods.isActive, true),
        ),
      });
      if (!paymentMethod) throw new AppError("Método de pago inválido", 400);
    }

    if (data.incurredAt && data.incurredAt > new Date()) {
      throw new AppError("La fecha del gasto no puede ser futura", 400);
    }
    const [created] = await tx.insert(expenses).values(data).returning();
    if (!created) throw new AppError("No se pudo registrar el gasto", 500);
    return created;
  }

  static async update(
    id: string,
    data: Partial<Omit<CreateExpenseData, "purchaseId">>,
  ) {
    if (Object.keys(data).length === 0) {
      throw new AppError("No se enviaron campos para actualizar", 400);
    }
    const [updated] = await db
      .update(expenses)
      .set(data)
      .where(eq(expenses.id, id))
      .returning();
    return updated ?? null;
  }

  static async remove(id: string) {
    const [removed] = await db
      .delete(expenses)
      .where(eq(expenses.id, id))
      .returning();
    return removed ?? null;
  }

  // ── Gastos fijos / recurrentes ───────────────────────────────

  static async getRecurring({ includeInactive = false } = {}) {
    return db.query.recurringExpenses.findMany({
      where: includeInactive ? undefined : eq(recurringExpenses.isActive, true),
      with: { category: true },
      orderBy: (r, { asc }) => [asc(r.dayOfMonth)],
    });
  }

  static async createRecurring(data: CreateRecurringData) {
    if (data.amount <= 0) throw new AppError("El monto debe ser positivo", 400);
    const [created] = await db
      .insert(recurringExpenses)
      .values(data)
      .returning();
    if (!created) throw new AppError("No se pudo crear el gasto fijo", 500);
    return created;
  }

  static async updateRecurring(
    id: string,
    data: Partial<CreateRecurringData> & { isActive?: boolean },
  ) {
    if (Object.keys(data).length === 0) {
      throw new AppError("No se enviaron campos para actualizar", 400);
    }
    const [updated] = await db
      .update(recurringExpenses)
      .set(data)
      .where(eq(recurringExpenses.id, id))
      .returning();
    return updated ?? null;
  }

  static async removeRecurring(id: string) {
    const [removed] = await db
      .update(recurringExpenses)
      .set({ isActive: false })
      .where(eq(recurringExpenses.id, id))
      .returning();
    return removed ?? null;
  }

  /**
   * Materializa los gastos fijos activos para un mes dado (YYYY-MM),
   * creando una fila en `expenses` por cada gasto fijo que todavía no
   * fue registrado ese mes. Idempotente.
   */
  static async runRecurring(month: string) {
    const [yearStr, monthStr] = month.split("-");
    const year = Number(yearStr);
    const m = Number(monthStr);
    if (!year || !m || m < 1 || m > 12) {
      throw new AppError("Mes inválido. Usar YYYY-MM", 400);
    }

    const monthStart = businessDayStart(
      `${year}-${String(m).padStart(2, "0")}-01`,
    );
    const nextYear = m === 12 ? year + 1 : year;
    const nextMonth = m === 12 ? 1 : m + 1;
    const monthEnd = new Date(
      businessDayStart(
        `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`,
      ).getTime() - 1,
    );

    const templates = await this.getRecurring();
    const alreadyThisMonth = await db.query.expenses.findMany({
      where: and(
        gte(expenses.incurredAt, monthStart),
        lte(expenses.incurredAt, monthEnd),
      ),
    });
    const doneIds = new Set(
      alreadyThisMonth
        .map((e) => e.recurringExpenseId)
        .filter((x): x is string => Boolean(x)),
    );

    const created = [];
    for (const tpl of templates) {
      if (doneIds.has(tpl.id)) continue;
      const day = Math.min(Math.max(tpl.dayOfMonth, 1), 28);
      const incurredAt = businessDayStart(
        `${year}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      );
      const row = await this.create({
        categoryId: tpl.categoryId,
        description: tpl.description,
        amount: tpl.amount,
        incurredAt,
        recurringExpenseId: tpl.id,
      });
      created.push(row);
    }
    return created;
  }
}
