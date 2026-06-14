import { verifyRole, verifyToken } from "@/middleware/auth.middleware";
import { Router } from "express";
import ReportController from "./controller/report";

const reportRouter = Router();

// Reportes financieros: solo admin.
reportRouter.use(verifyToken, verifyRole("admin"));

reportRouter.get("/summary", ReportController.summary);
reportRouter.get("/income", ReportController.income);
reportRouter.get("/expenses", ReportController.expenses);
reportRouter.get("/products", ReportController.products);
reportRouter.get("/services", ReportController.services);

export default reportRouter;
