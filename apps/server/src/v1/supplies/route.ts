import { verifyToken } from "@/middleware/auth.middleware";
import { PERMISSIONS } from "@/middleware/permissions";
import { requirePermission } from "@/middleware/permissions.middleware";
import { Router } from "express";
import SupplyController from "./controller/supply";

const supplyRouter = Router();

// Insumos: gestión interna, solo admin.
supplyRouter.use(verifyToken, requirePermission(PERMISSIONS.INVENTORY_MANAGE));

supplyRouter.get("/", SupplyController.getAll);
supplyRouter.get("/:id", SupplyController.getById);
supplyRouter.post("/", SupplyController.create);
supplyRouter.put("/:id", SupplyController.update);
supplyRouter.delete("/:id", SupplyController.remove);

export default supplyRouter;
