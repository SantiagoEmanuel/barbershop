import { HASH_SALT } from "@/constants/credentials.env";
import { db } from "@/db/db";
import { users } from "@/db/turso/schema";
import AppError from "@/utils/AppError";
import { compareSync, hashSync } from "bcrypt";
import { eq } from "drizzle-orm";

export type User = {
  id: string;
  email: string;
  name: string;
  username: string;
  role: "admin" | "client";
  phone: string;
  isActive: boolean;
  createdAt: Date;
  password: string;
};

type NewUser = {
  email: string;
  name: string;
  username: string;
  role: "admin" | "client";
  phone: string;
  password: string;
};

interface AuthProps {
  create: NewUser;
  update: User;
}

export default class AuthModel {
  static async login(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return user;
  }
  static async create(data: AuthProps["create"]) {
    const [newUser] = await db.insert(users).values(data).returning();

    if (!newUser) {
      throw new AppError("No se pudo crear el usuario", 500);
    }

    return newUser;
  }
  static async update(data: AuthProps["update"]) {
    const [updateUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, data.id))
      .returning();

    if (!updateUser) {
      throw new AppError("No se pudo actualizar el usuario", 400);
    }

    return updateUser;
  }
  static async getById(id: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!user) {
      throw new AppError("Usuario inexistente", 404);
    }
    return user;
  }
  static async hashPassword(password: string) {
    return hashSync(password, HASH_SALT);
  }
  static async hashVerify(password: string, hashed: string) {
    return compareSync(password, hashed);
  }
}
