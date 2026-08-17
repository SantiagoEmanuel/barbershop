import { optionalToken, verifyToken } from "@/middleware/auth.middleware";
import { PERMISSIONS } from "@/middleware/permissions";
import { requirePermission } from "@/middleware/permissions.middleware";
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
  requirePermission(PERMISSIONS.BARBERS_MANAGE),
  BarberController.create,
);
// Reemplaza la grilla horaria completa de un barbero (semana entera).
barberRouter.put(
  "/:id/schedules",
  verifyToken,
  requirePermission(PERMISSIONS.BARBER_SCHEDULES_MANAGE),
  BarberController.replaceSchedules,
);

barberRouter.post(
  "/schedule",
  verifyToken,
  requirePermission(PERMISSIONS.BARBER_SCHEDULES_MANAGE),
  BarberController.createSchedule,
);
barberRouter.put(
  "/schedule/:id",
  verifyToken,
  requirePermission(PERMISSIONS.BARBER_SCHEDULES_MANAGE),
  BarberController.updateSchedule,
);
barberRouter.put(
  "/:id",
  verifyToken,
  requirePermission(PERMISSIONS.BARBERS_MANAGE),
  BarberController.update,
);
barberRouter.delete(
  "/:id",
  verifyToken,
  requirePermission(PERMISSIONS.BARBERS_MANAGE),
  BarberController.remove,
);

export default barberRouter;
