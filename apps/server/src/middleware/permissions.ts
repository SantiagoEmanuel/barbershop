export const ROLES = ["admin", "client", "barber", "dev"] as const;
export type Role = (typeof ROLES)[number];
export type AppRole = Role;

/** Permisos funcionales del backend. Los roles son solo agrupaciones. */
export const PERMISSIONS = {
  USERS_READ: "users:read",
  USERS_MANAGE: "users:manage",
  APPOINTMENTS_CREATE: "appointments:create",
  APPOINTMENTS_READ_OWN: "appointments:read:own",
  APPOINTMENTS_READ_ANY: "appointments:read:any",
  APPOINTMENTS_UPDATE_OWN: "appointments:update:own",
  APPOINTMENTS_UPDATE_ANY: "appointments:update:any",
  APPOINTMENTS_OVERBOOK: "appointments:overbook",
  BARBERS_READ: "barbers:read",
  BARBERS_MANAGE: "barbers:manage",
  BARBER_SCHEDULES_MANAGE: "barber-schedules:manage",
  CATALOG_READ: "catalog:read",
  CATALOG_MANAGE: "catalog:manage",
  PAYMENT_METHODS_READ: "payment-methods:read",
  PAYMENT_METHODS_MANAGE: "payment-methods:manage",
  ORDERS_CREATE: "orders:create",
  ORDERS_READ: "orders:read",
  ORDERS_UPDATE: "orders:update",
  SALES_CREATE: "sales:create",
  INVENTORY_READ: "inventory:read",
  INVENTORY_MANAGE: "inventory:manage",
  FINANCE_MANAGE: "finance:manage",
  REPORTS_READ: "reports:read",
  DEVELOPMENT_ACCESS: "development:access",
  DEVELOPMENT_DEBUG: "development:debug",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const CLIENT_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.APPOINTMENTS_CREATE,
  PERMISSIONS.APPOINTMENTS_READ_OWN,
  PERMISSIONS.APPOINTMENTS_UPDATE_OWN,
  PERMISSIONS.BARBERS_READ,
  PERMISSIONS.CATALOG_READ,
  PERMISSIONS.PAYMENT_METHODS_READ,
  PERMISSIONS.ORDERS_CREATE,
];

const BARBER_PERMISSIONS: readonly Permission[] = [
  ...CLIENT_PERMISSIONS,
  PERMISSIONS.APPOINTMENTS_OVERBOOK,
  PERMISSIONS.SALES_CREATE,
];

const ADMIN_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.USERS_READ,
  PERMISSIONS.USERS_MANAGE,
  PERMISSIONS.APPOINTMENTS_READ_ANY,
  PERMISSIONS.APPOINTMENTS_UPDATE_ANY,
  PERMISSIONS.APPOINTMENTS_OVERBOOK,
  PERMISSIONS.BARBERS_READ,
  PERMISSIONS.BARBERS_MANAGE,
  PERMISSIONS.BARBER_SCHEDULES_MANAGE,
  PERMISSIONS.CATALOG_READ,
  PERMISSIONS.CATALOG_MANAGE,
  PERMISSIONS.PAYMENT_METHODS_READ,
  PERMISSIONS.PAYMENT_METHODS_MANAGE,
  PERMISSIONS.ORDERS_CREATE,
  PERMISSIONS.ORDERS_READ,
  PERMISSIONS.ORDERS_UPDATE,
  PERMISSIONS.SALES_CREATE,
  PERMISSIONS.INVENTORY_READ,
  PERMISSIONS.INVENTORY_MANAGE,
  PERMISSIONS.FINANCE_MANAGE,
  PERMISSIONS.REPORTS_READ,
];

const ALL_PERMISSIONS: readonly Permission[] = Object.values(
  PERMISSIONS,
) as Permission[];

const ROLE_PERMISSIONS: Record<AppRole, ReadonlySet<Permission>> = {
  client: new Set(CLIENT_PERMISSIONS),
  barber: new Set(BARBER_PERMISSIONS),
  admin: new Set(ADMIN_PERMISSIONS),
  // Un usuario dev no recibe un bypass especial en las rutas: recibe el
  // mismo conjunto explícito y auditable de permisos, más los de desarrollo.
  dev: new Set(ALL_PERMISSIONS),
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLES.includes(value as Role);
}

export function hasPermission(
  role: Role | undefined,
  permission: Permission,
): boolean {
  return role
    ? ROLE_PERMISSIONS[role as AppRole]?.has(permission) === true
    : false;
}

export function getRolePermissions(role: Role | AppRole): Permission[] {
  return [...(ROLE_PERMISSIONS[role as AppRole] ?? [])];
}

export function getRoleDefinitions() {
  return ROLES.map((role) => ({
    role,
    permissions: getRolePermissions(role),
  }));
}
