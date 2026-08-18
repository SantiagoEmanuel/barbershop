import { HASH_SALT } from "@/constants/credentials.env";
import { db } from "@/db/db";
import { publicUserColumns } from "@/db/turso/publicUserColumns";
import { users } from "@/db/turso/schema";
import {
  getRolePermissions,
  type AppRole,
  type Permission,
  type Role,
} from "@/middleware/permissions";
import AppError from "@/utils/AppError";
import { compareSync, hashSync } from "bcrypt";
import { and, eq, inArray, sql } from "drizzle-orm";

export type User = {
  id: string;
  email: string;
  name: string;
  username: string;
  role: AppRole;
  phone: string;
  isActive: boolean;
  createdAt: Date;
  password?: string;
  verify: boolean;
};

export type PublicUser = Omit<User, "password"> & {
  permissions: Permission[];
};

type NewUser = {
  email: string;
  name: string;
  username: string;
  phone: string;
  password: string;
};

interface AuthProps {
  create: NewUser;
  update: User;
}

export default class AuthModel {
  static toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      verify: user.verify,
      permissions: getRolePermissions(user.role),
    };
  }

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

    return this.toPublicUser(newUser);
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
  static async confirm(id: string) {
    const [user] = await db
      .update(users)
      .set({
        verify: true,
      })
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      return null;
    }

    return user;
  }
  static async getAdmins() {
    const data = await db.query.users.findMany({
      where: inArray(users.role, ["admin", "dev"]),
      columns: publicUserColumns,
    });

    if (!data) {
      throw new AppError("No se pueden obtener los datos", 500);
    }

    return data;
  }

  static async changeRole(
    userId: string,
    role: AppRole,
    actor: { id: string; role: Role },
  ) {
    if (userId === actor.id) {
      throw new AppError("No podés modificar tu propio rol", 400);
    }

    return db.transaction(async (tx) => {
      const currentUser = await tx.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!currentUser) {
        throw new AppError("Usuario inexistente", 404);
      }

      // El rol dev puede conceder capacidades de desarrollo y solo debe ser
      // administrado por otro dev mediante un procedimiento explícito.
      if (
        (currentUser.role === "dev" || role === "dev") &&
        actor.role !== "dev"
      ) {
        throw new AppError(
          "Solo un usuario dev puede administrar el rol dev",
          403,
        );
      }

      if (currentUser.role === "admin" && role !== "admin") {
        const [{ count }] = await tx
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(eq(users.role, "admin"));

        if (Number(count) <= 1) {
          throw new AppError(
            "No se puede degradar al último administrador",
            409,
          );
        }
      }

      const [updatedUser] = await tx
        .update(users)
        .set({ role })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        throw new AppError("No se pudo actualizar el rol", 500);
      }

      return updatedUser;
    });
  }
  /**
   * Usuarios activos que el admin puede vincular a un perfil de barbero.
   * Incluye a todos (un admin/dueño también puede cortar pelo), sin exponer
   * el hash de contraseña.
   */
  static async getLinkableUsers() {
    return db.query.users.findMany({
      where: eq(users.isActive, true),
      columns: publicUserColumns,
      orderBy: (u, { asc }) => [asc(u.name)],
    });
  }

  /**
   * Promueve un usuario a 'barber'. Solo afecta cuentas 'client': nunca
   * degrada a un admin (perdería el acceso al panel).
   */
  static async promoteToBarber(userId: string) {
    await db
      .update(users)
      .set({ role: "barber" })
      .where(and(eq(users.id, userId), eq(users.role, "client")));
  }

  static async hashPassword(password: string) {
    return hashSync(password, HASH_SALT);
  }
  static async hashVerify(password: string, hashed: string) {
    return compareSync(password, hashed);
  }
}
