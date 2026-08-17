import type { NextFunction, Request, Response } from "express";
import type { Permission } from "./permissions";
import { hasPermission } from "./permissions";

function forbidden(res: Response) {
  return res.status(403).json({
    message: "No tenés permisos para realizar esta acción",
    data: null,
  });
}

/** Requiere que el usuario tenga todos los permisos indicados. */
export function requirePermission(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado", data: null });
    }

    if (
      !permissions.every((permission) =>
        hasPermission(req.user?.role, permission),
      )
    ) {
      return forbidden(res);
    }

    return next();
  };
}

/** Requiere al menos uno de los permisos indicados. */
export function requireAnyPermission(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado", data: null });
    }

    if (
      !permissions.some((permission) =>
        hasPermission(req.user?.role, permission),
      )
    ) {
      return forbidden(res);
    }

    return next();
  };
}
