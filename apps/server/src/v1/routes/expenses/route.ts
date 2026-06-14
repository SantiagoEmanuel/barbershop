import { verifyRole, verifyToken } from "@/middleware/auth.middleware";
import { Router } from "express";
import ExpenseController from "./controller/expense";

const expenseRouter = Router();

// Egresos: información financiera sensible, solo admin.
expenseRouter.use(verifyToken, verifyRole("admin"));

// Rubros
expenseRouter.get("/categories", ExpenseController.getCategories);
expenseRouter.post("/categories", ExpenseController.createCategory);

// Gastos fijos / recurrentes
expenseRouter.get("/recurring", ExpenseController.getRecurring);
expenseRouter.post("/recurring", ExpenseController.createRecurring);
expenseRouter.post("/recurring/run", ExpenseController.runRecurring);
expenseRouter.put("/recurring/:id", ExpenseController.updateRecurring);
expenseRouter.delete("/recurring/:id", ExpenseController.removeRecurring);

// Gastos
expenseRouter.get("/", ExpenseController.getAll);
expenseRouter.post("/", ExpenseController.create);
expenseRouter.put("/:id", ExpenseController.update);
expenseRouter.delete("/:id", ExpenseController.remove);

export default expenseRouter;
