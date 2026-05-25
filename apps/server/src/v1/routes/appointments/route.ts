import { verifyRole, verifyToken } from "@/middleware/auth.middleware";
import { Router } from "express";
import AppointmentController from "./controller/appointment";

const appointmentRouter = Router();

appointmentRouter.post("/", AppointmentController.create);
appointmentRouter.get("/", AppointmentController.get);
appointmentRouter.get("/my", verifyToken, AppointmentController.my);
appointmentRouter.get(
  "/:id",
  verifyToken,
  verifyRole("admin"),
  AppointmentController.getById,
);
appointmentRouter.put("/:id/status", verifyToken, AppointmentController.update);

export default appointmentRouter;
