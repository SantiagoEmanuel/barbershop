import { JWT_SECRET } from "@/constants/credentials.env";
import { db } from "@/db/db";
import { users } from "@/db/turso/schema";
import { and, eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

export type Role = "admin" | "client" | "barber";

export interface JwtPayload {
  id: string;
  role: Role;
  email: string;
}

// Declaration merging para tipar req.user en toda la app
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const ROLES: readonly Role[] = ["admin", "client", "barber"];

function isJwtPayload(value: unknown): value is JwtPayload {
  if (!value || typeof value !== "object") return false;

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.id === "string" &&
    typeof payload.email === "string" &&
    typeof payload.role === "string" &&
    ROLES.includes(payload.role as Role)
  );
}

const authenticate =
  (required: boolean) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const reject = (message: string) => {
      if (!required) {
        next();
        return;
      }

      return res.status(401).json({ message, data: null });
    };

    const token = req.cookies.auth_token;
    if (!token) return reject("Token requerido");

    let payload: JwtPayload;
    try {
      const decoded = verify(token, JWT_SECRET);
      if (!isJwtPayload(decoded)) {
        return reject("Token inválido o expirado");
      }
      payload = decoded;
    } catch {
      return reject("Token inválido o expirado");
    }

    let currentUser: { id: string; email: string; role: Role } | undefined;
    try {
      currentUser = await db.query.users.findFirst({
        where: and(eq(users.id, payload.id), eq(users.isActive, true)),
        columns: {
          id: true,
          email: true,
          role: true,
        },
      });
    } catch (err) {
      return next(err);
    }

    if (
      !currentUser ||
      currentUser.email !== payload.email ||
      currentUser.role !== payload.role
    ) {
      return reject("Token inválido o expirado");
    }

    req.user = currentUser;
    return next();
  };

/** Autenticación opcional para endpoints públicos que admiten sesión. */
export const optionalToken = authenticate(false);

/** Autenticación obligatoria para endpoints protegidos. */
export const verifyToken = authenticate(true);

/**
 * Verificación del rol del usuario, debe usarse luego de verifyToken.
 */
export function verifyRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado", data: null });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "No tenés permisos para realizar esta acción",
        data: null,
      });
    }

    next();
  };
}
