import { verifyRole, verifyToken } from "@/middleware/auth.middleware";
import { authLimiter } from "@/middleware/ratelimiter.middleware";
import { Router } from "express";
import AuthController from "./controller/auth";

const authRouter = Router();

authRouter.post("/", authLimiter, AuthController.login);
authRouter.post("/logout", AuthController.logout);
authRouter.post("/create", authLimiter, AuthController.create);
authRouter.get("/confirm", AuthController.confirm);
authRouter.post("/restore-session", AuthController.restoreSession);
authRouter.get(
  "/get-admins",
  verifyToken,
  verifyRole("admin"),
  AuthController.getAdminUsers,
);
authRouter.get(
  "/users",
  verifyToken,
  verifyRole("admin"),
  AuthController.getUsers,
);

export default authRouter;
