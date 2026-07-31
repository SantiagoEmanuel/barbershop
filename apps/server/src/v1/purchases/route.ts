import { verifyRole, verifyToken } from "@/middleware/auth.middleware";
import { Router } from "express";
import PurchaseController from "./controller/purchase";

const purchaseRouter = Router();

// Compras / ingreso de stock: solo admin.
purchaseRouter.use(verifyToken, verifyRole("admin"));

purchaseRouter.get("/", PurchaseController.getAll);
purchaseRouter.post("/", PurchaseController.create);

export default purchaseRouter;
