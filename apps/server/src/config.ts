import v1 from "@/v1/app/app";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { json } from "express";
import helmet from "helmet";
import { HOST, LOCALHOST_IP } from "./constants/credentials.env";
import { checkToken } from "./middleware/auth.middleware";
import { errorHandler } from "./middleware/error.middleware";

const app = express();
const isProd = process.env.NODE_ENV === "production";

// ── Middlewares globales ──────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: { action: "deny" },
    strictTransportSecurity: isProd
      ? { maxAge: 31536000, includeSubDomains: true }
      : false,
    hidePoweredBy: true,
    noSniff: true,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(
  cors({
    origin: isProd ? JSON.parse(HOST) : JSON.parse(LOCALHOST_IP),
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(json());
app.use(checkToken);

app.use("/api/v1", v1);

// ── Health ────────────────────────────────────────────────────
v1.get("/status", (_req, res) => {
  return res.status(200).json({ message: "OK" });
});

app.use(errorHandler);

export default app;
