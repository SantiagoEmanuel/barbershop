import { optionalToken, verifyToken } from "@/middleware/auth.middleware";
import { PERMISSIONS } from "@/middleware/permissions";
import {
  requireAnyPermission,
  requirePermission,
} from "@/middleware/permissions.middleware";
import { Router } from "express";
import AppointmentController from "./controller/appointment";

const appointmentRouter = Router();

appointmentRouter.post("/", optionalToken, AppointmentController.create);
// Público: confirmación desde el link del email (cliente sin sesión)
appointmentRouter.patch("/:id/confirm", AppointmentController.confirm);
appointmentRouter.get(
  "/",
  verifyToken,
  requirePermission(PERMISSIONS.APPOINTMENTS_READ_ANY),
  AppointmentController.get,
);
appointmentRouter.get(
  "/my",
  verifyToken,
  requirePermission(PERMISSIONS.APPOINTMENTS_READ_OWN),
  AppointmentController.my,
);
appointmentRouter.get(
  "/:id",
  verifyToken,
  requirePermission(PERMISSIONS.APPOINTMENTS_READ_ANY),
  AppointmentController.getById,
);
appointmentRouter.put(
  "/:id/status",
  verifyToken,
  requireAnyPermission(
    PERMISSIONS.APPOINTMENTS_UPDATE_ANY,
    PERMISSIONS.APPOINTMENTS_UPDATE_OWN,
  ),
  AppointmentController.update,
);

export default appointmentRouter;
