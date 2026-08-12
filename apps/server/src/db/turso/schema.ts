import { relations, sql } from "drizzle-orm";
import {
  check,
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
     * 'admin'  puede gestionar barberos, servicios y ver todas las órdenes.
     * 'barber' es un usuario vinculado a un perfil de barbero (corta pelo).
     * 'client' solo puede crear y ver sus propios turnos.
     */
    role: text("role", { enum: ["admin", "client", "barber"] })
      .notNull()
      .default("client"),
    /** Útil para recordatorios por WhatsApp o SMS. */
    phone: text("phone").notNull().unique(),
    /**
     * Soft-delete: nunca borrar un usuario con historial de turnos.
     * is_active = false lo oculta del sistema sin romper FK históricas.
     */
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    verify: integer("verify", { mode: "boolean" }).notNull().default(false),
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
    userId: text("user_id").references(() => users.id),
  },
  (t) => [
    // Filtro habitual: solo mostrar barberos activos
    index("idx_barbers_is_active").on(t.isActive),
    index("idx_barbers_slug").on(t.slug),
    index("idx_barbers_user_id").on(t.userId),
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

export const overbookedAppointments = table(
  "overbooked_appointment",
  {
    id: id(),
    barberId: text("barber_id")
      .notNull()
      .references(() => barbers.id),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id),
    clientName: text("client_name").notNull(),
    clientPhone: text("client_phone").notNull(),
    date: text("date").notNull(),
    /** Hora de inicio: 'HH:MM' */
    startTime: text("start_time").notNull(),
    /**
     * Hora de fin: start_time + service.durationMinutes.
     * Se persiste para no recalcular en cada consulta de disponibilidad
     * y para hacer queries de overlap eficientemente.
     */
    endTime: text("end_time").notNull(),
    /** Los turnos extraordinarios se gestionan igual que los regulares. */
    status: text("status", {
      enum: ["pending", "confirmed", "completed", "cancelled", "no_show"],
    })
      .notNull()
      .default("confirmed"),
    cancelledAt: integer("cancelled_at", { mode: "timestamp" }),
    /**
     * Precio capturado al momento de la reserva, en centavos.
     * Independiente de futuros cambios en services.price.
     * Es el precio que el cliente aceptó pagar.
     */
    priceSnapshot: integer("price_snapshot").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    /**
     * Índice compuesto principal: la query más frecuente del sistema
     * es "todos los turnos del barbero X para la fecha Y".
     * Sin este índice compuesto esa query hace full scan.
     */
    index("idx_overbooked_barber_date").on(t.barberId, t.date),
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
    overbookedAppointmentId: text("overbooked_appointment_id")
      .unique()
      .references(() => overbookedAppointments.id),
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
    // Una orden puede corresponder a un turno regular, extraordinario o a una
    // venta de mostrador. Lo único inválido es vincularla a ambos tipos.
    check(
      "orders_at_most_one_appointment",
      sql`NOT (appointment_id IS NOT NULL AND overbooked_appointment_id IS NOT NULL)`,
    ),
    uniqueIndex("uq_orders_appointment")
      .on(t.appointmentId)
      .where(sql`appointment_id IS NOT NULL`),

    uniqueIndex("uq_orders_overbooked_appointment")
      .on(t.overbookedAppointmentId)
      .where(sql`overbooked_appointment_id IS NOT NULL`),
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
    /**
     * Costo unitario de compra en centavos. Se usa para calcular la
     * rentabilidad (price - cost) de cada producto. Default 0 para no
     * romper filas existentes en el push; se carga desde inventario.
     */
    cost: integer("cost").notNull().default(0),
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
    /**
     * Costo unitario capturado al momento de la venta, en centavos.
     * Permite calcular la ganancia histórica (priceSnapshot - costSnapshot)
     * aunque después cambie products.cost. Default 0 para el push.
     */
    costSnapshot: integer("cost_snapshot").notNull().default(0),
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
// SUPPLIES (insumos — se consumen, no se venden)
// ─────────────────────────────────────────────

export const supplies = table(
  "supplies",
  {
    id: id(),
    name: text("name").notNull(),
    description: text("description"),
    /** Unidad de medida: 'ml', 'unidad', 'gr', etc. (solo informativo). */
    unit: text("unit").notNull().default("unidad"),
    /** Último costo unitario de compra, en centavos. */
    cost: integer("cost").notNull().default(0),
    /** Stock actual. Sube con compras, baja con ajuste manual de consumo. */
    stock: integer("stock").notNull().default(0),
    /** Umbral para alertar bajo stock (nullable = sin alerta). */
    lowStockThreshold: integer("low_stock_threshold"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("idx_supplies_is_active").on(t.isActive)],
);

// ─────────────────────────────────────────────
// EXPENSE CATEGORIES (rubros de gasto)
// ─────────────────────────────────────────────

export const expenseCategories = table("expense_categories", {
  id: id(),
  name: text("name").notNull().unique(),
  /**
   * 'fixed'    → gasto fijo recurrente (alquiler, luz, sueldos)
   * 'variable' → gasto variable (compra de productos/insumos)
   */
  kind: text("kind", { enum: ["fixed", "variable"] }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
});

// ─────────────────────────────────────────────
// PURCHASES (ingreso de stock — origen de un egreso variable)
// ─────────────────────────────────────────────

export const purchases = table(
  "purchases",
  {
    id: id(),
    /** Discriminador: la compra ingresa un producto o un insumo. */
    itemType: text("item_type", { enum: ["product", "supply"] }).notNull(),
    productId: text("product_id").references(() => products.id),
    supplyId: text("supply_id").references(() => supplies.id),
    quantity: integer("quantity").notNull(),
    /** Costo unitario de esta compra, en centavos. Actualiza el cost del ítem. */
    unitCost: integer("unit_cost").notNull(),
    /** quantity * unitCost (denormalizado para reportes). */
    totalCost: integer("total_cost").notNull(),
    supplier: text("supplier"),
    purchasedAt: integer("purchased_at", { mode: "timestamp_ms" })
      .notNull()
      .$default(() => new Date()),
    createdAt: createdAt(),
  },
  (t) => [
    index("idx_purchases_product_id").on(t.productId),
    index("idx_purchases_supply_id").on(t.supplyId),
    index("idx_purchases_purchased_at").on(t.purchasedAt),
  ],
);

// ─────────────────────────────────────────────
// RECURRING EXPENSES (gastos fijos mensuales — plantillas)
// ─────────────────────────────────────────────

export const recurringExpenses = table(
  "recurring_expenses",
  {
    id: id(),
    categoryId: text("category_id")
      .notNull()
      .references(() => expenseCategories.id),
    description: text("description").notNull(),
    /** Monto mensual, en centavos. */
    amount: integer("amount").notNull(),
    /** Día del mes en que se factura (1-28 recomendado). */
    dayOfMonth: integer("day_of_month").notNull().default(1),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("idx_recurring_expenses_is_active").on(t.isActive)],
);

// ─────────────────────────────────────────────
// EXPENSES (egresos — libro de salidas de dinero)
// ─────────────────────────────────────────────

export const expenses = table(
  "expenses",
  {
    id: id(),
    categoryId: text("category_id")
      .notNull()
      .references(() => expenseCategories.id),
    description: text("description").notNull(),
    /** Monto del egreso, en centavos. */
    amount: integer("amount").notNull(),
    /** Fecha en que aplica el gasto. */
    incurredAt: integer("incurred_at", { mode: "timestamp_ms" })
      .notNull()
      .$default(() => new Date()),
    paymentMethodId: text("payment_method_id").references(
      () => paymentMethods.id,
    ),
    /** Seteado cuando el egreso proviene de una compra de stock. */
    purchaseId: text("purchase_id").references(() => purchases.id),
    /** Seteado cuando el egreso fue materializado desde un gasto fijo. */
    recurringExpenseId: text("recurring_expense_id").references(
      () => recurringExpenses.id,
    ),
    createdAt: createdAt(),
  },
  (t) => [
    index("idx_expenses_category_id").on(t.categoryId),
    index("idx_expenses_incurred_at").on(t.incurredAt),
  ],
);

// ─────────────────────────────────────────────
// RELATIONS (para Drizzle query API con .with())
// ─────────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  appointments: many(appointments),
  barbers: one(barbers),
}));

export const barbersRelations = relations(barbers, ({ many, one }) => ({
  schedules: many(barberSchedules),
  overrides: many(barberScheduleOverrides),
  appointments: many(appointments),
  overbookedAppointments: many(overbookedAppointments),
  productSales: many(productSales),
  users: one(users),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  appointments: many(appointments),
}));

export const paymentMethodsRelations = relations(
  paymentMethods,
  ({ many }) => ({
    orders: many(orders),
    expenses: many(expenses),
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

export const overbookedAppointmentsRelations = relations(
  overbookedAppointments,
  ({ one }) => ({
    barber: one(barbers, {
      fields: [overbookedAppointments.barberId],
      references: [barbers.id],
    }),
    service: one(services, {
      fields: [overbookedAppointments.serviceId],
      references: [services.id],
    }),
    order: one(orders, {
      fields: [overbookedAppointments.id],
      references: [orders.overbookedAppointmentId],
    }),
  }),
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  appointment: one(appointments, {
    fields: [orders.appointmentId],
    references: [appointments.id],
  }),
  overbookedAppointment: one(overbookedAppointments, {
    fields: [orders.overbookedAppointmentId],
    references: [overbookedAppointments.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [orders.paymentMethodId],
    references: [paymentMethods.id],
  }),
  productSales: many(productSales),
}));

export const productsRelations = relations(products, ({ many }) => ({
  sales: many(productSales),
  purchases: many(purchases),
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

export const suppliesRelations = relations(supplies, ({ many }) => ({
  purchases: many(purchases),
}));

export const expenseCategoriesRelations = relations(
  expenseCategories,
  ({ many }) => ({
    expenses: many(expenses),
    recurringExpenses: many(recurringExpenses),
  }),
);

export const purchasesRelations = relations(purchases, ({ one }) => ({
  product: one(products, {
    fields: [purchases.productId],
    references: [products.id],
  }),
  supply: one(supplies, {
    fields: [purchases.supplyId],
    references: [supplies.id],
  }),
}));

export const recurringExpensesRelations = relations(
  recurringExpenses,
  ({ one, many }) => ({
    category: one(expenseCategories, {
      fields: [recurringExpenses.categoryId],
      references: [expenseCategories.id],
    }),
    expenses: many(expenses),
  }),
);

export const expensesRelations = relations(expenses, ({ one }) => ({
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [expenses.paymentMethodId],
    references: [paymentMethods.id],
  }),
  purchase: one(purchases, {
    fields: [expenses.purchaseId],
    references: [purchases.id],
  }),
  recurringExpense: one(recurringExpenses, {
    fields: [expenses.recurringExpenseId],
    references: [recurringExpenses.id],
  }),
}));
