export interface Supply {
  id: string;
  name: string;
  description?: string | null;
  unit: string;
  /** Costo unitario, en centavos. */
  cost: number;
  stock: number;
  lowStockThreshold?: number | null;
  isActive?: boolean;
}
