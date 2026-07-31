import { verifyRole, verifyToken } from "@/middleware/auth.middleware";
import { Router } from "express";
import ProductController from "./controller/product";

const productRouter = Router();

// Públicos — el cliente ve el catálogo
productRouter.get("/", ProductController.getAll);
productRouter.get("/:id", ProductController.getById);

// Solo admin
productRouter.post(
  "/",
  verifyToken,
  verifyRole("admin"),
  ProductController.create,
);
productRouter.put(
  "/:id",
  verifyToken,
  verifyRole("admin"),
  ProductController.update,
);
productRouter.delete(
  "/:id",
  verifyToken,
  verifyRole("admin"),
  ProductController.remove,
);

export default productRouter;
