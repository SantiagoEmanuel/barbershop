import {
  optionalToken,
  verifyRole,
  verifyToken,
} from "@/middleware/auth.middleware";
import { Router } from "express";
import BarberController from "./controller/barber";

const barberRouter = Router();

// Barbero del usuario logueado — debe ir antes de "/:slug"
barberRouter.get("/me", verifyToken, BarberController.me);

// Públicos — el cliente necesita ver barberos y sus horarios
barberRouter.get("/", optionalToken, BarberController.getAll);
barberRouter.get("/:slug", BarberController.getBySlug);

// Solo admin
barberRouter.post(
  "/",
  verifyToken,
  verifyRole("admin"),
  BarberController.create,
);
// Reemplaza la grilla horaria completa de un barbero (semana entera).
barberRouter.put(
  "/:id/schedules",
  verifyToken,
  verifyRole("admin"),
  BarberController.replaceSchedules,
);

barberRouter.post(
  "/schedule",
  verifyToken,
  verifyRole("admin"),
  BarberController.createSchedule,
);
barberRouter.put(
  "/schedule/:id",
  verifyToken,
  verifyRole("admin"),
  BarberController.updateSchedule,
);
barberRouter.put(
  "/:id",
  verifyToken,
  verifyRole("admin"),
  BarberController.update,
);
barberRouter.delete(
  "/:id",
  verifyToken,
  verifyRole("admin"),
  BarberController.remove,
);

export default barberRouter;
