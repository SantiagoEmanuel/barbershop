export type UserRole = "admin" | "client" | "barber";

export type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  phone: string;
  isActive: boolean;
  createdAt: Date;
};
