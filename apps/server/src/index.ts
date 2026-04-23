import cors from "cors";
import express, { json } from "express";
import helmet from "helmet";

import { PORT } from "@/constants/credentials.env";
import { errorHandler } from "@/middleware/error.middleware";
import availabilityRouter from "@/routes/availability/route";
import barberRouter from "@/routes/barber/route";
import orderRouter from "@/routes/orders/route";
import paymentMethodRouter from "@/routes/payment-methods/route";
import productRouter from "@/routes/products/route";
import scheduleRouter from "@/routes/schedules/route";
import serviceRouter from "@/routes/services/route";

const app = express();

// ── Middlewares globales ──────────────────────────────────────
app.use(cors());
app.use(helmet());
app.use(json());

// ── Rutas ─────────────────────────────────────────────────────
app.use("/api/availability", availabilityRouter);
app.use("/api/barber", barberRouter);
app.use("/api/service", serviceRouter);
app.use("/api/order", orderRouter);
app.use("/api/product", productRouter);
app.use("/api/payment-method", paymentMethodRouter);
app.use("/api/schedule", scheduleRouter);

// ── Health ────────────────────────────────────────────────────
app.get("/status", (_req, res) => {
  res.status(200).json({ message: "OK" });
});

// ── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    message: "Not found",
    data: "Creo que estás perdido...¿o no?",
  });
});

// ── Error handler global ----------------------────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor levantado en http://localhost:${PORT}`);
});
