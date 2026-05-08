export type UserRole = "admin" | "client";

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
