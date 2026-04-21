import { Router } from "express";
import OrderController from "./controller/order";

const orderRouter = Router();

orderRouter.get("/", OrderController.getOrders);
orderRouter.post("/", OrderController.createOrder);
orderRouter.put("/:id/update", OrderController.updateOrder);

export default orderRouter;
