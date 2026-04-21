import cors from "cors";
import { config } from "dotenv";
import express, { json } from "express";
import helmet from "helmet";
import orderRouter from "./routes/orders/route";
import shiftRouter from "./routes/shifts/route";

config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(helmet());
app.use(json());

// Routes
app.use("/api/shift", shiftRouter);
app.use("/api/order", orderRouter);

// Health
app.get("/ok", (req, res) => {
  return res.status(200).json({ message: "OK", status: 200 });
});
app.get("/status", (req, res) => {
  return res.status(200).json({
    message: "OK",
  });
});

app.get("/", (req, res) => {
  res.status(404).json({
    message: "Not found",
    data: "Creo que estás perdido...¿o no?",
  });
});

app.listen(PORT || 3000, () => {
  console.log(
    `Servidor levantado en http://localhost:${PORT || 3000}, puerto: ${PORT}`,
  );
});
