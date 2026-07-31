import { NODE_ENV } from "@/constants/credentials.env";
import rateLimit from "express-rate-limit";

const isProd = NODE_ENV === "production";

export const generalLimiter = isProd
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 200,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: {
        message: "Demasiadas solicitudes. Intentá de nuevo en 15 minutos.",
        data: null,
      },
    })
  : null;

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message:
      "Demasiados intentos de autenticación. Intentá de nuevo en 15 minutos.",
    data: null,
  },
});

export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Demasiadas reservas en poco tiempo. Intentá de nuevo más tarde.",
    data: null,
  },
});
