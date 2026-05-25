import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("[ErrorHandler]", err);

  const status: number = typeof err.status === "number" ? err.status : 500;

  const message = err.message ?? "Error interno del servidor";
  return res.status(status).json({
    message,
    data: null,
  });
};
