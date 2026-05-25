import { verifyRole, verifyToken } from "@/middleware/auth.middleware";
import { Router } from "express";
import ServiceController from "./controller/service";

const serviceRouter = Router();

// Públicos
serviceRouter.get("/", ServiceController.getAll);
serviceRouter.get("/:id", ServiceController.getById);

// Solo admin
serviceRouter.post(
  "/",
  verifyToken,
  verifyRole("admin"),
  ServiceController.create,
);
serviceRouter.put(
  "/:id",
  verifyToken,
  verifyRole("admin"),
  ServiceController.update,
);
serviceRouter.delete(
  "/:id",
  verifyToken,
  verifyRole("admin"),
  ServiceController.remove,
);

export default serviceRouter;
