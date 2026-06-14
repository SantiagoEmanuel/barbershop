export type ExpenseKind = "fixed" | "variable";

export interface ExpenseCategory {
  id: string;
  name: string;
  kind: ExpenseKind;
  isActive?: boolean;
}

export interface Expense {
  id: string;
  categoryId: string;
  description: string;
  amount: number;
  incurredAt: string;
  paymentMethodId?: string | null;
  purchaseId?: string | null;
  recurringExpenseId?: string | null;
  category?: ExpenseCategory | null;
}

export interface RecurringExpense {
  id: string;
  categoryId: string;
  description: string;
  amount: number;
  dayOfMonth: number;
  isActive?: boolean;
  category?: ExpenseCategory | null;
}
