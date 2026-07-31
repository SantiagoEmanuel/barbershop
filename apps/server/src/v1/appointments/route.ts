import { verifyRole, verifyToken } from "@/middleware/auth.middleware";
import { Router } from "express";
import AppointmentController from "./controller/appointment";

const appointmentRouter = Router();

appointmentRouter.post("/", AppointmentController.create);
// Público: confirmación desde el link del email (cliente sin sesión)
appointmentRouter.patch("/:id/confirm", AppointmentController.confirm);
appointmentRouter.get(
  "/",
  verifyToken,
  verifyRole("admin"),
  AppointmentController.get,
);
appointmentRouter.get("/my", verifyToken, AppointmentController.my);
appointmentRouter.get(
  "/:id",
  verifyToken,
  verifyRole("admin"),
  AppointmentController.getById,
);
appointmentRouter.put("/:id/status", verifyToken, AppointmentController.update);

export default appointmentRouter;
