import { verifyRole, verifyToken } from "@/middleware/auth.middleware";
import { Router } from "express";
import OrderController from "./controller/order";

const orderRouter = Router();

orderRouter.get(
  "/all",
  verifyToken,
  verifyRole("admin"),
  OrderController.getAll,
);

orderRouter.get(
  "/",
  verifyToken,
  verifyRole("admin"),
  OrderController.getOrders,
);

orderRouter.get(
  "/:id",
  verifyToken,
  verifyRole("admin"),
  OrderController.getById,
);

orderRouter.post("/", verifyToken, OrderController.create);

orderRouter.put(
  "/:id/update",
  verifyToken,
  verifyRole("admin"),
  OrderController.update,
);

export default orderRouter;
