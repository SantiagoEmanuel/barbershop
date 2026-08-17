import type { Permission, User } from "../types";

/** La UI solo orienta la navegación; el backend sigue siendo la autoridad. */
export function hasPermission(
  user: User | null | undefined,
  permission: Permission,
): boolean {
  if (!user) return false;
  if (user.permissions) return user.permissions.includes(permission);

  // Compatibilidad con sesiones antiguas guardadas en localStorage.
  return user.role === "admin" || user.role === "dev";
}

export function hasAllPermissions(
  user: User | null | undefined,
  permissions: Permission[],
): boolean {
  return (
    Boolean(user) &&
    permissions.length > 0 &&
    permissions.every((permission) => hasPermission(user, permission))
  );
}

export function hasAnyPermission(
  user: User | null | undefined,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}
