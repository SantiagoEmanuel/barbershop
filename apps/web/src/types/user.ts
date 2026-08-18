import type { Permission } from "./permissions";

export type UserRole = "admin" | "client" | "barber" | "dev";

export type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  /** Opcional para compatibilidad con sesiones persistidas anteriores. */
  permissions?: Permission[];
  phone: string;
  isActive: boolean;
  createdAt: Date;
};
