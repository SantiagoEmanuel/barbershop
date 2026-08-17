import { verifyToken } from "@/middleware/auth.middleware";
import { PERMISSIONS } from "@/middleware/permissions";
import { requirePermission } from "@/middleware/permissions.middleware";
import { authLimiter } from "@/middleware/ratelimiter.middleware";
import { Router } from "express";
import AuthController from "./controller/auth";

const authRouter = Router();

authRouter.post("/", authLimiter, AuthController.login);
authRouter.post("/logout", AuthController.logout);
authRouter.post("/create", authLimiter, AuthController.create);
authRouter.get("/confirm", AuthController.confirm);
authRouter.post("/restore-session", AuthController.restoreSession);
authRouter.get("/me", verifyToken, AuthController.me);
authRouter.get("/permissions", verifyToken, AuthController.permissions);
authRouter.get(
  "/roles",
  verifyToken,
  requirePermission(PERMISSIONS.USERS_MANAGE),
  AuthController.roles,
);
authRouter.get(
  "/get-admins",
  verifyToken,
  requirePermission(PERMISSIONS.USERS_READ),
  AuthController.getAdminUsers,
);
authRouter.get(
  "/users",
  verifyToken,
  requirePermission(PERMISSIONS.USERS_READ),
  AuthController.getUsers,
);
authRouter.patch(
  "/users/:id/role",
  verifyToken,
  requirePermission(PERMISSIONS.USERS_MANAGE),
  AuthController.updateRole,
);

export default authRouter;
