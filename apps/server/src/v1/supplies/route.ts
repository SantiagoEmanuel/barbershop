import { verifyRole, verifyToken } from "@/middleware/auth.middleware";
import { Router } from "express";
import SupplyController from "./controller/supply";

const supplyRouter = Router();

// Insumos: gestión interna, solo admin.
supplyRouter.use(verifyToken, verifyRole("admin"));

supplyRouter.get("/", SupplyController.getAll);
supplyRouter.get("/:id", SupplyController.getById);
supplyRouter.post("/", SupplyController.create);
supplyRouter.put("/:id", SupplyController.update);
supplyRouter.delete("/:id", SupplyController.remove);

export default supplyRouter;
