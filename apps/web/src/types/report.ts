export interface NamedAmount {
  name: string;
  amount: number;
}

export interface DayAmount {
  date: string;
  amount: number;
}

export interface ReportSummary {
  income: number;
  expenses: number;
  balance: number;
  ordersCount: number;
  incomeBreakdown: {
    services: number;
    products: number;
    byMethod: NamedAmount[];
  };
  expenseBreakdown: {
    fixed: number;
    variable: number;
    byCategory: NamedAmount[];
  };
}

export interface IncomeReport {
  total: number;
  count: number;
  averageTicket: number;
  byDay: DayAmount[];
  orders: {
    id: string;
    amount: number;
    paidAt: string;
    paymentMethod: string | null;
    service: string | null;
    barber: string | null;
    productsCount: number;
  }[];
}

export interface ExpenseReport {
  total: number;
  count: number;
  fixed: number;
  variable: number;
  byDay: DayAmount[];
  byCategory: NamedAmount[];
  expenses: {
    id: string;
    description: string;
    amount: number;
    incurredAt: string;
    category: string | null;
    kind: "fixed" | "variable" | null;
    paymentMethod: string | null;
  }[];
}

export interface ProductPerformance {
  id: string;
  name: string;
  qtySold: number;
  revenue: number;
  cogs: number;
  profit: number;
  marginPct: number;
}

export interface ServicePerformance {
  id: string;
  name: string;
  qty: number;
  revenue: number;
  averageTicket: number;
}
