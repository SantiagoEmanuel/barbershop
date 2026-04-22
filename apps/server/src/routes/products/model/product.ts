import { db } from "@/db/db";
import { products } from "@/db/turso/schema";
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
    if (data.stock < 0) throw new Error("El stock no puede ser negativo");
    const [created] = await db.insert(products).values(data).returning();
    if (!created) throw new Error("No se pudo crear el producto");
    return created;
  }

  static async update(id: string, data: UpdateProductData) {
    if (Object.keys(data).length === 0) {
      throw new Error("No se enviaron campos para actualizar");
    }
    if (data.stock !== undefined && data.stock < 0) {
      throw Object.assign(new Error("El stock no puede ser negativo"), {
        status: 400,
      });
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
    if (!product)
      throw Object.assign(new Error("Producto no encontrado"), { status: 404 });
    if (product.stock < quantity) {
      throw Object.assign(
        new Error(`Stock insuficiente. Disponible: ${product.stock}`),
        { status: 400 },
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
