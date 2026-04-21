import { Router } from "express";
import ShiftController from "./controller/shift";

const shiftRouter = Router();

shiftRouter.post("/", ShiftController.generateShift);
shiftRouter.put("/:id/update", ShiftController.updateShift);
shiftRouter.put("/:id/cancelled", ShiftController.cancelledShift);

export default shiftRouter;
