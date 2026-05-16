import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable as table,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ─────────────────────────────────────────────
// Helpers reutilizables
// ─────────────────────────────────────────────

/** UUID generado en runtime por la DB (crypto.randomUUID). */
const id = () =>
  text("id")
    .primaryKey()
    .$default(() => crypto.randomUUID());

/** Timestamp de creación, inmutable. */
const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$default(() => new Date());

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

export const users = table(
  "users",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    /**
     * 'admin' puede gestionar barberos, servicios y ver todas las órdenes.
     * 'client' solo puede crear y ver sus propios turnos.
     */
    role: text("role", { enum: ["admin", "client"] })
      .notNull()
      .default("client"),
    /** Útil para recordatorios por WhatsApp o SMS. */
    phone: text("phone"),
    /**
     * Soft-delete: nunca borrar un usuario con historial de turnos.
     * is_active = false lo oculta del sistema sin romper FK históricas.
     */
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [
    // Consultas frecuentes: login por email, búsqueda por username
    index("idx_users_email").on(t.email),
    index("idx_users_username").on(t.username),
    index("idx_users_role").on(t.role),
  ],
);

// ─────────────────────────────────────────────
// BARBERS
// ─────────────────────────────────────────────

export const barbers = table(
  "barbers",
  {
    id: id(),
    name: text("name").notNull(),
    /** Slug para URLs limpias: /barbero/juan-perez */
    slug: text("slug").notNull().unique(),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    experienceYears: integer("experience_years"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [
    // Filtro habitual: solo mostrar barberos activos
    index("idx_barbers_is_active").on(t.isActive),
    index("idx_barbers_slug").on(t.slug),
  ],
);

// ─────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────

export const services = table(
  "services",
  {
    id: id(),
    name: text("name").notNull().unique(),
    description: text("description"),
    /**
     * Precio en centavos (enteros). Nunca como text o float.
     * $5.000 ARS = 500000. Evita errores de redondeo y permite
     * comparaciones y sumas directas sin conversión.
     */
    price: integer("price").notNull(),
    /**
     * Duración en minutos. Clave para calcular el end_time de un
     * turno y para generar los slots disponibles del día.
     */
    durationMinutes: integer("duration_minutes").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
    key: integer("key"),
    icon: text("icon"),
  },
  (t) => [index("idx_services_is_active").on(t.isActive)],
);

// ─────────────────────────────────────────────
// PAYMENT METHODS
// ─────────────────────────────────────────────

export const paymentMethods = table("payment_methods", {
  id: id(),
  name: text("name").notNull(),
  /**
   * 'cash'   → efectivo, pago al final en el local
   * 'card'   → débito/crédito en el local
   * 'online' → MercadoPago, Stripe, etc. (requiere flujo de webhook)
   */
  type: text("type", { enum: ["cash", "card", "online"] }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
});

// ─────────────────────────────────────────────
// BARBER SCHEDULES (plantilla semanal)
// ─────────────────────────────────────────────

export const barberSchedules = table(
  "barber_schedules",
  {
    id: id(),
    barberId: text("barber_id")
      .notNull()
      .references(() => barbers.id),
    /**
     * Día de la semana: 0 = domingo … 6 = sábado.
     * Representa el horario recurrente semanal del barbero.
     */
    dayOfWeek: integer("day_of_week").notNull(),
    /** Formato 'HH:MM', ej: '09:00' */
    startTime: text("start_time").notNull(),
    /** Formato 'HH:MM', ej: '19:00' */
    endTime: text("end_time").notNull(),
    startBreak: text("start_brake").notNull(),
    endBreak: text("end_brake").notNull(),
    /**
     * Cada cuántos minutos existe un slot disponible.
     * Debe coincidir con (o ser múltiplo de) service.durationMinutes.
     */
    slotDurationMinutes: integer("slot_duration_minutes").notNull().default(30),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  },
  (t) => [
    // "Dame el horario del barbero X para el día Y"
    index("idx_barber_schedules_barber_id").on(t.barberId),
    index("idx_barber_schedules_barber_day").on(t.barberId, t.dayOfWeek),
  ],
);

// ─────────────────────────────────────────────
// BARBER SCHEDULE OVERRIDES (excepciones puntuales)
// ─────────────────────────────────────────────

export const barberScheduleOverrides = table(
  "barber_schedule_overrides",
  {
    id: id(),
    barberId: text("barber_id")
      .notNull()
      .references(() => barbers.id),
    /**
     * Fecha exacta de la excepción (ISO: 'YYYY-MM-DD').
     * Permite manejar feriados y vacaciones sin tocar la
     * plantilla semanal base del barbero.
     */
    date: text("date").notNull(),
    /** true = el barbero no trabaja ese día (feriado/vacación). */
    isDayOff: integer("is_day_off", { mode: "boolean" })
      .notNull()
      .default(false),
    /** Si ese día empieza más tarde de lo habitual. */
    customStartTime: text("custom_start_time"),
    /** Si ese día termina antes de lo habitual. */
    customEndTime: text("custom_end_time"),
  },
  (t) => [
    // "¿Tiene alguna excepción el barbero X para la fecha Y?"
    index("idx_overrides_barber_date").on(t.barberId, t.date),
  ],
);

// ─────────────────────────────────────────────
// APPOINTMENTS (turnos — núcleo del negocio)
// ─────────────────────────────────────────────

export const appointments = table(
  "appointments",
  {
    id: id(),
    barberId: text("barber_id")
      .notNull()
      .references(() => barbers.id),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id),
    /**
     * FK al usuario registrado. Nullable para admitir turnos
     * walk-in o telefónicos sin cuenta en el sistema.
     */
    clientId: text("client_id").references(() => users.id),
    /** Para turnos sin cuenta registrada (walk-in / telefónico). */
    clientName: text("client_name").notNull(),
    clientPhone: text("client_phone").notNull(),
    clientEmail: text("client_email").notNull(),
    /** Fecha del turno en formato ISO 'YYYY-MM-DD'. */
    date: text("date").notNull(),
    /** Hora de inicio: 'HH:MM' */
    startTime: text("start_time").notNull(),
    /**
     * Hora de fin: start_time + service.durationMinutes.
     * Se persiste para no recalcular en cada consulta de disponibilidad
     * y para hacer queries de overlap eficientemente.
     */
    endTime: text("end_time").notNull(),
    /**
     * Precio capturado al momento de la reserva, en centavos.
     * Independiente de futuros cambios en services.price.
     * Es el precio que el cliente aceptó pagar.
     */
    priceSnapshot: integer("price_snapshot").notNull(),
    /**
     * pending   → reservado, sin confirmar
     * confirmed → confirmado por el local
     * completed → turno realizado
     * cancelled → cancelado (por cliente o por el local)
     * no_show   → el cliente no se presentó
     */
    status: text("status", {
      enum: ["pending", "confirmed", "completed", "cancelled", "no_show"],
    })
      .notNull()
      .default("pending"),
    notes: text("notes"),
    createdAt: createdAt(),
    cancelledAt: integer("cancelled_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    /**
     * Índice compuesto principal: la query más frecuente del sistema
     * es "todos los turnos del barbero X para la fecha Y".
     * Sin este índice compuesto esa query hace full scan.
     */
    index("idx_appointments_barber_date").on(t.barberId, t.date),
    /**
     * Para verificar solapamiento de slots al reservar:
     * WHERE barber_id = ? AND date = ? AND start_time < ? AND end_time > ?
     */
    index("idx_appointments_barber_date_time").on(
      t.barberId,
      t.date,
      t.startTime,
      t.endTime,
    ),
    // Historial de turnos de un cliente registrado
    index("idx_appointments_client_id").on(t.clientId),
    // Filtrar por estado (ej: todos los 'pending' del día)
    index("idx_appointments_status").on(t.status),
    // Restringir doble reserva: un barbero no puede tener dos turnos
    // que empiecen a la misma hora en el mismo día
    uniqueIndex("uq_appointments_barber_date_start")
      .on(t.barberId, t.date, t.startTime)
      .where(sql`status IN ('pending', 'confirmed')`),
  ],
);

// ─────────────────────────────────────────────
// ORDERS (pagos — separados del turno)
// ─────────────────────────────────────────────

export const orders = table(
  "orders",
  {
    id: id(),
    /**
     * Un turno solo puede tener una orden de pago activa.
     * UNIQUE enforza esto a nivel DB, no solo en la app.
     */
    appointmentId: text("appointment_id")
      .unique()
      .references(() => appointments.id),
    paymentMethodId: text("payment_method_id")
      .notNull()
      .references(() => paymentMethods.id),
    /** Monto efectivamente cobrado, en centavos. */
    amount: integer("amount").notNull(),
    /**
     * pending  → esperando pago (especialmente pagos online)
     * paid     → pago confirmado
     * refunded → reembolsado
     * failed   → pago fallido (solo relevante para pagos online)
     */
    status: text("status", {
      enum: ["pending", "paid", "refunded", "failed"],
    })
      .notNull()
      .default("pending"),
    /**
     * ID del pago en el proveedor externo (MercadoPago, Stripe).
     * MercadoPago envía webhooks con este ID — necesitamos encontrar
     * la orden en O(1), de ahí el índice.
     */
    externalPaymentId: text("external_payment_id"),
    /** URL de pago para redirigir al cliente (MercadoPago checkout). */
    externalPaymentUrl: text("external_payment_url"),
    /** Estado raw devuelto por el proveedor ('approved', 'rejected', etc.) */
    externalPaymentStatus: text("external_payment_status"),
    paidAt: integer("paid_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
  },
  (t) => [
    // Lookup de webhook: POST /webhook/mp → buscar por external_payment_id
    index("idx_orders_external_payment_id").on(t.externalPaymentId),
    index("idx_orders_status").on(t.status),
  ],
);

// ─────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────

export const products = table(
  "products",
  {
    id: id(),
    name: text("name").notNull(),
    description: text("description"),
    price: integer("price").notNull(),
    /** Stock actual. Se descuenta en cada product_sale. */
    stock: integer("stock").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("idx_products_is_active").on(t.isActive)],
);

// ─────────────────────────────────────────────
// PRODUCT SALES (ventas en mostrador)
// ─────────────────────────────────────────────

export const productSales = table(
  "product_sales",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    /**
     * Nullable: una venta de producto puede estar ligada a un turno
     * (ej: el barbero vendió cera después del corte) o ser una venta
     * independiente en mostrador.
     */
    orderId: text("order_id").references(() => orders.id),
    /** Barbero que realizó la venta (para comisiones y reportes). */
    soldBy: text("sold_by")
      .notNull()
      .references(() => barbers.id),
    quantity: integer("quantity").notNull(),
    /** Precio unitario al momento de la venta, en centavos. */
    priceSnapshot: integer("price_snapshot").notNull(),
    soldAt: integer("sold_at", { mode: "timestamp_ms" })
      .notNull()
      .$default(() => new Date()),
  },
  (t) => [
    index("idx_product_sales_product_id").on(t.productId),
    index("idx_product_sales_order_id").on(t.orderId),
    index("idx_product_sales_sold_by").on(t.soldBy),
    // Reportes de ventas por período
    index("idx_product_sales_sold_at").on(t.soldAt),
  ],
);

// ─────────────────────────────────────────────
// RELATIONS (para Drizzle query API con .with())
// ─────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
}));

export const barbersRelations = relations(barbers, ({ many }) => ({
  schedules: many(barberSchedules),
  overrides: many(barberScheduleOverrides),
  appointments: many(appointments),
  productSales: many(productSales),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  appointments: many(appointments),
}));

export const paymentMethodsRelations = relations(
  paymentMethods,
  ({ many }) => ({
    orders: many(orders),
  }),
);

export const barberSchedulesRelations = relations(
  barberSchedules,
  ({ one }) => ({
    barber: one(barbers, {
      fields: [barberSchedules.barberId],
      references: [barbers.id],
    }),
  }),
);

export const barberScheduleOverridesRelations = relations(
  barberScheduleOverrides,
  ({ one }) => ({
    barber: one(barbers, {
      fields: [barberScheduleOverrides.barberId],
      references: [barbers.id],
    }),
  }),
);

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  barber: one(barbers, {
    fields: [appointments.barberId],
    references: [barbers.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  client: one(users, {
    fields: [appointments.clientId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [appointments.id],
    references: [orders.appointmentId],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  appointment: one(appointments, {
    fields: [orders.appointmentId],
    references: [appointments.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [orders.paymentMethodId],
    references: [paymentMethods.id],
  }),
  productSales: many(productSales),
}));

export const productsRelations = relations(products, ({ many }) => ({
  sales: many(productSales),
}));

export const productSalesRelations = relations(productSales, ({ one }) => ({
  product: one(products, {
    fields: [productSales.productId],
    references: [products.id],
  }),
  order: one(orders, {
    fields: [productSales.orderId],
    references: [orders.id],
  }),
  barber: one(barbers, {
    fields: [productSales.soldBy],
    references: [barbers.id],
  }),
}));
