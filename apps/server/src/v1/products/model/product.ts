import { db, type DbOrTx } from "@/db/db";
import { orders, products, productSales } from "@/db/turso/schema";
import AppError from "@/utils/AppError";
import { eq, sql } from "drizzle-orm";

interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
}

interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  isActive?: boolean;
}

interface CreateSaleData {
  orderId: string;
  soldBy: string;
  quantity: number;
}

export default class ProductModel {
  static async getAll({ includeInactive = false } = {}) {
    const data = await db.query.products.findMany({
      where: includeInactive ? undefined : eq(products.isActive, true),
      orderBy: (p, { asc }) => [asc(p.name)],
    });
    return data;
  }

  static async getById(id: string) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    return product ?? null;
  }

  static async create(data: CreateProductData) {
    if (
      !data.name.trim() ||
      data.name.length > 120 ||
      !Number.isSafeInteger(data.price) ||
      data.price <= 0 ||
      (data.cost !== undefined &&
        (!Number.isSafeInteger(data.cost) || data.cost < 0)) ||
      !Number.isSafeInteger(data.stock) ||
      data.stock < 0
    ) {
      throw new AppError("Datos de producto inválidos", 400);
    }
    const [created] = await db.insert(products).values(data).returning();
    if (!created) throw new AppError("No se pudo crear el producto", 500);
    return created;
  }

  static async update(id: string, data: UpdateProductData) {
    if (Object.keys(data).length === 0) {
      throw new AppError("No se enviaron campos para actualizar", 404);
    }
    if (
      (data.name !== undefined &&
        (!data.name.trim() || data.name.length > 120)) ||
      (data.price !== undefined &&
        (!Number.isSafeInteger(data.price) || data.price <= 0)) ||
      (data.cost !== undefined &&
        (!Number.isSafeInteger(data.cost) || data.cost < 0))
    ) {
      throw new AppError("Datos de producto inválidos", 400);
    }

    const [updated] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();

    return updated ?? null;
  }

  /**
   * Aumenta el stock de un producto y, opcionalmente, actualiza su costo
   * unitario. Pensado para el ingreso de stock por compras. Si se pasa `tx`
   * corre dentro de una transacción existente.
   */
  static async incrementStock(
    id: string,
    quantity: number,
    newCost?: number,
    tx: DbOrTx = db,
  ) {
    const set: Record<string, unknown> = {
      stock: sql`${products.stock} + ${quantity}`,
    };
    if (newCost !== undefined) set.cost = newCost;

    const [updated] = await tx
      .update(products)
      .set(set)
      .where(eq(products.id, id))
      .returning();

    if (!updated) throw new AppError("Producto no encontrado", 404);
    return updated;
  }

  static async decrementStock(id: string, quantity: number) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    if (!product) throw new AppError("Producto no encontrado", 404);
    if (product.stock < quantity) {
      throw new AppError(
        `Stock insuficiente. Disponible: ${product.stock}`,
        400,
      );
    }

    const [updated] = await db
      .update(products)
      .set({ stock: sql`${products.stock} - ${quantity}` })
      .where(eq(products.id, id))
      .returning();

    return updated;
  }

  /** Soft-delete */
  static async remove(id: string) {
    const [removed] = await db
      .update(products)
      .set({ isActive: false })
      .where(eq(products.id, id))
      .returning();
    return removed ?? null;
  }

  static async createSale(productId: string, data: CreateSaleData) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });
    if (!product) throw new AppError("Producto no encontrado", 404);
    if (!product.isActive) {
      throw new AppError("No se puede vender un producto inactivo", 400);
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, data.orderId),
    });
    if (!order) throw new AppError("Orden no encontrada", 404);

    if (product.stock < data.quantity) {
      throw new AppError(
        `Stock insuficiente. Disponible: ${product.stock}`,
        400,
      );
    }

    return db.transaction(async (tx) => {
      const [sale] = await tx
        .insert(productSales)
        .values({
          productId,
          orderId: data.orderId,
          soldBy: data.soldBy,
          quantity: data.quantity,
          // Nunca confiar en el precio enviado por el frontend: ambos
          // snapshots se toman del catálogo dentro de la transacción.
          priceSnapshot: product.price,
          costSnapshot: product.cost,
        })
        .returning();

      if (!sale) throw new AppError("No se pudo registrar la venta", 500);

      await tx
        .update(products)
        .set({ stock: sql`${products.stock} - ${data.quantity}` })
        .where(eq(products.id, productId));

      return sale;
    });
  }
}
