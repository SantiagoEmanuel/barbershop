import { optionalToken, verifyToken } from "@/middleware/auth.middleware";
import { PERMISSIONS } from "@/middleware/permissions";
import { requirePermission } from "@/middleware/permissions.middleware";
import { Router } from "express";
import PaymentMethodController from "./controller/paymentMethod";

const paymentMethodRouter = Router();

// Público — necesario para el form de reserva (mostrar opciones de pago)
paymentMethodRouter.get("/", optionalToken, PaymentMethodController.getAll);
paymentMethodRouter.get("/:id", PaymentMethodController.getById);

// Solo admin
paymentMethodRouter.post(
  "/",
  verifyToken,
  requirePermission(PERMISSIONS.PAYMENT_METHODS_MANAGE),
  PaymentMethodController.create,
);
paymentMethodRouter.put(
  "/:id",
  verifyToken,
  requirePermission(PERMISSIONS.PAYMENT_METHODS_MANAGE),
  PaymentMethodController.update,
);

export default paymentMethodRouter;
