import { verifyToken } from "@/middleware/auth.middleware";
import { PERMISSIONS } from "@/middleware/permissions";
import { requirePermission } from "@/middleware/permissions.middleware";
import { Router } from "express";
import PurchaseController from "./controller/purchase";

const purchaseRouter = Router();

// Compras / ingreso de stock: solo admin.
purchaseRouter.use(
  verifyToken,
  requirePermission(PERMISSIONS.INVENTORY_MANAGE),
);

purchaseRouter.get("/", PurchaseController.getAll);
purchaseRouter.post("/", PurchaseController.create);

export default purchaseRouter;
