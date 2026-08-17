import { verifyToken } from "@/middleware/auth.middleware";
import { PERMISSIONS } from "@/middleware/permissions";
import { requirePermission } from "@/middleware/permissions.middleware";
import { Router } from "express";
import OrderController from "./controller/order";

const orderRouter = Router();

orderRouter.get(
  "/all",
  verifyToken,
  requirePermission(PERMISSIONS.ORDERS_READ),
  OrderController.getAll,
);

orderRouter.get(
  "/",
  verifyToken,
  requirePermission(PERMISSIONS.ORDERS_READ),
  OrderController.getOrders,
);

orderRouter.get(
  "/:id",
  verifyToken,
  requirePermission(PERMISSIONS.ORDERS_READ),
  OrderController.getById,
);

// Crear orden simple (flujo histórico, ligada o no a un turno)
orderRouter.post(
  "/",
  verifyToken,
  requirePermission(PERMISSIONS.ORDERS_CREATE),
  OrderController.create,
);

// Venta de mostrador / cierre de servicio: crea la orden (paga) y registra
// las ventas de producto del carrito, descontando stock.
orderRouter.post(
  "/create",
  verifyToken,
  requirePermission(PERMISSIONS.SALES_CREATE),
  OrderController.createByBarber,
);

orderRouter.put(
  "/:id/update",
  verifyToken,
  requirePermission(PERMISSIONS.ORDERS_UPDATE),
  OrderController.update,
);

export default orderRouter;
