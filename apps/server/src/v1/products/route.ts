import { optionalToken, verifyToken } from "@/middleware/auth.middleware";
import { PERMISSIONS } from "@/middleware/permissions";
import { requirePermission } from "@/middleware/permissions.middleware";
import { Router } from "express";
import ProductController from "./controller/product";

const productRouter = Router();

// Públicos — el cliente ve el catálogo
productRouter.get("/", optionalToken, ProductController.getAll);
productRouter.get("/:id", ProductController.getById);

// Solo admin
productRouter.post(
  "/",
  verifyToken,
  requirePermission(PERMISSIONS.CATALOG_MANAGE),
  ProductController.create,
);
productRouter.put(
  "/:id",
  verifyToken,
  requirePermission(PERMISSIONS.CATALOG_MANAGE),
  ProductController.update,
);
productRouter.delete(
  "/:id",
  verifyToken,
  requirePermission(PERMISSIONS.CATALOG_MANAGE),
  ProductController.remove,
);

export default productRouter;
