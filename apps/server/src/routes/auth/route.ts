import { Router } from "express";
import AuthController from "./controller/auth";

const authRouter = Router();

authRouter.post("/", AuthController.login);
authRouter.post("/logout", AuthController.logout);
authRouter.post("/create", AuthController.create);
authRouter.get("/confirm", AuthController.confirm);
authRouter.post("/restore-session", AuthController.restoreSession);

export default authRouter;
