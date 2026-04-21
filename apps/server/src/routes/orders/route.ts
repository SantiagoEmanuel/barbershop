import { Router } from "express";
import OrderController from "./controller/order";

const orderRouter = Router();

orderRouter.get("/", (req, res) => {
  res.status(200).json({
    message: "In progress",
  });
});

orderRouter.post("/", OrderController.createOrder);
orderRouter.put("/:id/update", OrderController.updateOrder);

export default orderRouter;
