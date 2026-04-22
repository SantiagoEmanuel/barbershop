import { Router } from "express";
import AvailabilityController from "./controller/availability";

const availabilityRouter = Router();

// GET /api/availability?barberId=&date=YYYY-MM-DD
availabilityRouter.get("/", AvailabilityController.getSlots);

export default availabilityRouter;
