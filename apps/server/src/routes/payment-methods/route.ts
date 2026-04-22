import { verifyRole, verifyToken } from "@/middleware/auth.middleware";
import { Router } from "express";
import PaymentMethodController from "./controller/paymentMethod";

const paymentMethodRouter = Router();

// Público — necesario para el form de reserva (mostrar opciones de pago)
paymentMethodRouter.get("/", PaymentMethodController.getAll);
paymentMethodRouter.get("/:id", PaymentMethodController.getById);

// Solo admin
paymentMethodRouter.post(
  "/",
  verifyToken,
  verifyRole("admin"),
  PaymentMethodController.create,
);
paymentMethodRouter.put(
  "/:id",
  verifyToken,
  verifyRole("admin"),
  PaymentMethodController.update,
);

export default paymentMethodRouter;
