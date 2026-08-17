import { optionalToken, verifyToken } from "@/middleware/auth.middleware";
import { PERMISSIONS } from "@/middleware/permissions";
import { requirePermission } from "@/middleware/permissions.middleware";
import { Router } from "express";
import ServiceController from "./controller/service";

const serviceRouter = Router();

// Públicos
serviceRouter.get("/", optionalToken, ServiceController.getAll);
serviceRouter.get("/:id", ServiceController.getById);

// Solo admin
serviceRouter.post(
  "/",
  verifyToken,
  requirePermission(PERMISSIONS.CATALOG_MANAGE),
  ServiceController.create,
);
serviceRouter.put(
  "/:id",
  verifyToken,
  requirePermission(PERMISSIONS.CATALOG_MANAGE),
  ServiceController.update,
);
serviceRouter.delete(
  "/:id",
  verifyToken,
  requirePermission(PERMISSIONS.CATALOG_MANAGE),
  ServiceController.remove,
);

export default serviceRouter;
