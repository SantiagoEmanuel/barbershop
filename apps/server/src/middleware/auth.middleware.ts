import { JWT_SECRET } from "@/constants/credentials.env";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
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

export function checkToken(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies.auth_token;

  if (!token) {
    next();
    return;
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
  } catch {
    // Token inválido o expirado: continuamos como usuario anónimo.
    // No bloqueamos acá; las rutas protegidas usan verifyToken.
  }

  next();
  return;
}

/**
 * Verifica que el request tenga un JWT válido en el header Authorization.
 * Si es válido, adjunta el payload decodificado en req.user.
 */
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Token requerido", data: null });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res
      .status(401)
      .json({ message: "Token inválido o expirado", data: null });
  }
}

/**
 * Factory que retorna un middleware que verifica el rol del usuario.
 * Debe usarse después de verifyToken.
 */
export function verifyRole(...roles: Array<"admin" | "client">) {
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
