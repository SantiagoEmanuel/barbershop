import { relations } from "drizzle-orm";
import { integer, sqliteTable as table, text } from "drizzle-orm/sqlite-core";

const ID = text("id")
  .primaryKey()
  .$default(() => crypto.randomUUID());
const CREATED_AT = integer("created_at", { mode: "timestamp_ms" }).$default(
  () => new Date(),
);

export const users = table("users", {
  id: ID,
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const services = table("services", {
  id: ID,
  name: text("name").notNull().unique(),
  description: text("description"),
  price: text("price").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const products = table("products", {
  id: ID,
  name: text("name").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const schedule = table("schedule", {
  id: ID,
  hour: text("hour").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: CREATED_AT,
});

export const barber = table("barber", {
  id: ID,
  name: text("name").notNull(),
  description: text("description"),
  experience: integer("experience"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const saleItems = table("sale_items", {
  id: ID,
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: text("price").notNull(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
});

export const shifts = table("shift", {
  id: ID,
  scheduleId: text("schedule_id")
    .notNull()
    .references(() => schedule.id),
  barberId: text("barber_id")
    .notNull()
    .references(() => barber.id),
  createdAt: CREATED_AT,
  isCancelled: integer("is_cancelled", { mode: "boolean" }).default(false),
});

export const paymentMethod = table("payment_method", {
  id: ID,
  name: text("name").notNull(),
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const orders = table("orders", {
  id: ID,
  email: text("email").notNull(),
  serviceId: text("service_id")
    .notNull()
    .references(() => services.id),
  shiftId: text("shift_id")
    .notNull()
    .references(() => shifts.id),
  paymentMethodId: text("payment_method_id")
    .notNull()
    .references(() => paymentMethod.id),
  paymentStatus: text("payment_status")
    .notNull()
    .$default(() => "PENDING"),
  createdAt: CREATED_AT,
});

export const paymentMethodRelations = relations(paymentMethod, ({ many }) => ({
  orders: many(orders),
}));

export const saleItemsRelations = relations(saleItems, ({ many, one }) => ({
  products: many(products),
  order: one(orders, {
    fields: [saleItems.orderId],
    references: [orders.id],
  }),
}));

export const shiftsRelations = relations(shifts, ({ one }) => ({
  schedule: one(schedule, {
    fields: [shifts.scheduleId],
    references: [schedule.id],
  }),
  barber: one(barber, {
    fields: [shifts.barberId],
    references: [barber.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  paymentMethod: many(paymentMethod),
  shift: many(shifts),
}));
