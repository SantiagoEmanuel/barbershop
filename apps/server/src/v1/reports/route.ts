import { verifyToken } from "@/middleware/auth.middleware";
import { PERMISSIONS } from "@/middleware/permissions";
import { requirePermission } from "@/middleware/permissions.middleware";
import { Router } from "express";
import ReportController from "./controller/report";

const reportRouter = Router();

// Reportes financieros: solo admin.
reportRouter.use(verifyToken, requirePermission(PERMISSIONS.REPORTS_READ));

reportRouter.get("/summary", ReportController.summary);
reportRouter.get("/income", ReportController.income);
reportRouter.get("/expenses", ReportController.expenses);
reportRouter.get("/products", ReportController.products);
reportRouter.get("/services", ReportController.services);

export default reportRouter;
