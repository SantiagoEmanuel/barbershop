import { JWT_SECRET } from "@/constants/credentials.env";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  role: "admin" | "client";
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

/**
 * Verifica que el request tenga un JWT válido en el header Authorization.
 * Si es válido, adjunta el payload decodificado en req.user.
 */
export function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token requerido", data: null });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido o expirado", data: null });
  }
}

/**
 * Factory que retorna un middleware que verifica el rol del usuario.
 * Debe usarse después de verifyToken.
 */
export function verifyRole(...roles: Array<"admin" | "client">) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "No autenticado", data: null });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: "No tenés permisos para realizar esta acción",
        data: null,
      });
      return;
    }

    next();
  };
}
