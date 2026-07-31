import { JWT_SECRET } from "@/constants/credentials.env";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

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

export function checkToken(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies.auth_token;

  if (!token) {
    next();
    return;
  }

  // En caso de haber token se guarda el contenido del usuario
  try {
    req.user = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
  } catch {
    //
    console.log("Usuario anónimo");
  }

  next();
  return;
}

/**
 * Verifica que el request tenga un JWT válido en las cookies.
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
