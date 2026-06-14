export interface Purchase {
  id: string;
  itemType: "product" | "supply";
  productId?: string | null;
  supplyId?: string | null;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier?: string | null;
  purchasedAt: string;
}
