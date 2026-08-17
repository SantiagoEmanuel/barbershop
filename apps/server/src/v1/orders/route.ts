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

// Crear orden simple (flujo histórico, ligada o no a un turno)
orderRouter.post("/", verifyToken, OrderController.create);

// Venta de mostrador / cierre de servicio: crea la orden (paga) y registra
// las ventas de producto del carrito, descontando stock.
orderRouter.post(
  "/create",
  verifyToken,
  verifyRole("admin", "barber"),
  OrderController.createByBarber,
);

orderRouter.put(
  "/:id/update",
  verifyToken,
  verifyRole("admin"),
  OrderController.update,
);

export default orderRouter;
