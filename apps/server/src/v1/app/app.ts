import {
  authLimiter,
  bookingLimiter,
} from "@/middleware/ratelimiter.middleware";
import appointmentRouter from "@/v1/routes/appointments/route";
import authRouter from "@/v1/routes/auth/route";
import availabilityRouter from "@/v1/routes/availability/route";
import barberRouter from "@/v1/routes/barber/route";
import orderRouter from "@/v1/routes/orders/route";
import paymentMethodRouter from "@/v1/routes/payment-methods/route";
import productRouter from "@/v1/routes/products/route";
import serviceRouter from "@/v1/routes/services/route";
import { Router } from "express";
import MPRouter from "../routes/mercadopago/route";

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
v1.use("/payment-methods", paymentMethodRouter);
v1.use("/appointments", appointmentRouter);
v1.use("/mercadopago", MPRouter);

// ── Health ────────────────────────────────────────────────────
v1.get("/status", (_req, res) => {
  return res.status(200).json({ message: "OK" });
});

// ── 404 ───────────────────────────────────────────────────────
v1.use((_req, res) => {
  return res.status(404).json({
    message: "Not found",
    data: "Creo que estás perdido...¿o no?",
  });
});

export default v1;
