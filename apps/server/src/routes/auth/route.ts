import { Router } from "express";
import AuthController from "./controller/auth";

const authRouter = Router();

authRouter.post("/", AuthController.login);

authRouter.post("/create", AuthController.create);

authRouter.post("/restore-session", AuthController.restoreSession);

export default authRouter;
