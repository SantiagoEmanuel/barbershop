import { db } from "@/db/db";
import { products } from "@/db/turso/schema";
import AppError from "@/utils/AppError";
import { eq, sql } from "drizzle-orm";

interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  stock: number;
}

interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
}

export default class ProductModel {
  static async getAll({ includeInactive = false } = {}) {
    return db.query.products.findMany({
      where: includeInactive ? undefined : eq(products.isActive, true),
      orderBy: (p, { asc }) => [asc(p.name)],
    });
  }

  static async getById(id: string) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    return product ?? null;
  }

  static async create(data: CreateProductData) {
    if (data.stock < 0)
      throw new AppError("El stock no puede ser negativo", 400);
    const [created] = await db.insert(products).values(data).returning();
    if (!created) throw new AppError("No se pudo crear el producto", 500);
    return created;
  }

  static async update(id: string, data: UpdateProductData) {
    if (Object.keys(data).length === 0) {
      throw new AppError("No se enviaron campos para actualizar", 404);
    }
    if (data.stock !== undefined && data.stock < 0) {
      throw new AppError("El stock no puede ser negativo", 400);
    }

    const [updated] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();

    return updated ?? null;
  }

  /** Descuenta stock al vender un producto. Lanza error si no hay suficiente. */
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
}
