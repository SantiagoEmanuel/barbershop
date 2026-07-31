import { db } from "@/db/db";
import { purchases } from "@/db/turso/schema";
import AppError from "@/utils/AppError";
import ExpenseModel from "@/v1/expenses/model/expense";
import ProductModel from "@/v1/products/model/product";
import SupplyModel from "@/v1/supplies/model/supply";
import { and, eq, gte, lte } from "drizzle-orm";

interface CreatePurchaseData {
  itemType: "product" | "supply";
  productId?: string;
  supplyId?: string;
  quantity: number;
  unitCost: number;
  supplier?: string;
  purchasedAt?: Date;
  /** Método de pago del egreso generado (opcional). */
  paymentMethodId?: string;
}

interface RangeFilter {
  from?: Date;
  to?: Date;
  itemType?: "product" | "supply";
}

export default class PurchaseModel {
  static async getAll(filter: RangeFilter = {}) {
    const conditions = [];
    if (filter.from) conditions.push(gte(purchases.purchasedAt, filter.from));
    if (filter.to) conditions.push(lte(purchases.purchasedAt, filter.to));
    if (filter.itemType)
      conditions.push(eq(purchases.itemType, filter.itemType));

    return db.query.purchases.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      with: { product: true, supply: true },
      orderBy: (p, { desc }) => [desc(p.purchasedAt)],
    });
  }

  /**
   * Registra una compra (ingreso de stock). En una sola transacción:
   *  1. inserta la fila en `purchases`,
   *  2. aumenta el stock del producto/insumo y actualiza su costo,
   *  3. inserta el egreso variable ligado a la compra.
   */
  static async create(data: CreatePurchaseData) {
    if (data.quantity <= 0)
      throw new AppError("La cantidad debe ser positiva", 400);
    if (data.unitCost < 0)
      throw new AppError("El costo unitario no puede ser negativo", 400);

    const isProduct = data.itemType === "product";
    const itemId = isProduct ? data.productId : data.supplyId;
    if (!itemId) {
      throw new AppError(isProduct ? "Falta productId" : "Falta supplyId", 400);
    }

    // Validar que el ítem exista antes de abrir la transacción.
    const item = isProduct
      ? await ProductModel.getById(itemId)
      : await SupplyModel.getById(itemId);
    if (!item) {
      throw new AppError(
        isProduct ? "Producto no encontrado" : "Insumo no encontrado",
        404,
      );
    }

    const totalCost = data.quantity * data.unitCost;
    const purchasedAt = data.purchasedAt ?? new Date();

    // Rubro variable según el tipo de ítem (Productos / Insumos).
    const category = await ExpenseModel.ensureCategory(
      isProduct ? "Productos" : "Insumos",
      "variable",
    );

    return db.transaction(async (tx) => {
      const [purchase] = await tx
        .insert(purchases)
        .values({
          itemType: data.itemType,
          productId: isProduct ? itemId : undefined,
          supplyId: isProduct ? undefined : itemId,
          quantity: data.quantity,
          unitCost: data.unitCost,
          totalCost,
          supplier: data.supplier,
          purchasedAt,
        })
        .returning();

      if (!purchase) throw new AppError("No se pudo registrar la compra", 500);

      if (isProduct) {
        await ProductModel.incrementStock(
          itemId,
          data.quantity,
          data.unitCost,
          tx,
        );
      } else {
        await SupplyModel.incrementStock(
          itemId,
          data.quantity,
          data.unitCost,
          tx,
        );
      }

      await ExpenseModel.create(
        {
          categoryId: category.id,
          description: `Compra: ${item.name} x${data.quantity}`,
          amount: totalCost,
          incurredAt: purchasedAt,
          paymentMethodId: data.paymentMethodId,
          purchaseId: purchase.id,
        },
        tx,
      );

      return purchase;
    });
  }
}
