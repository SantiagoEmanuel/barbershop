import {
  authLimiter,
  bookingLimiter,
} from "@/middleware/ratelimiter.middleware";
import appointmentRouter from "@/v1/appointments/route";
import authRouter from "@/v1/auth/route";
import availabilityRouter from "@/v1/availability/route";
import barberRouter from "@/v1/barber/route";
import expenseRouter from "@/v1/expenses/route";
import orderRouter from "@/v1/orders/route";
import paymentMethodRouter from "@/v1/payment-methods/route";
import productRouter from "@/v1/products/route";
import purchaseRouter from "@/v1/purchases/route";
import reportRouter from "@/v1/reports/route";
import serviceRouter from "@/v1/services/route";
import supplyRouter from "@/v1/supplies/route";
import { Router } from "express";
import MPRouter from "../mercadopago/route";

const v1 = Router();

// ── Limitadores -----------------------------------------------------
v1.use("/auth/login", authLimiter);
v1.use("/auth/register", authLimiter);
v1.use("/appointments", bookingLimiter);

// ── Rutas ─────────────────────────────────────────────────────
v1.use("/auth", authRouter);
v1.use("/availability", availabilityRouter);
v1.use("/barber", barberRouter);
v1.use("/service", serviceRouter);
v1.use("/order", orderRouter);
v1.use("/product", productRouter);
v1.use("/supplies", supplyRouter);
v1.use("/purchases", purchaseRouter);
v1.use("/expenses", expenseRouter);
v1.use("/reports", reportRouter);
v1.use("/payment-methods", paymentMethodRouter);
v1.use("/appointments", appointmentRouter);
v1.use("/mercadopago", MPRouter);

// ── 404 ───────────────────────────────────────────────────────
v1.use((_req, res) => {
  return res.status(404).json({
    message: "Not found",
    data: "Creo que estás perdido...¿o no?",
  });
});

export default v1;
