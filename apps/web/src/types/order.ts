export type OrderStatus = "pending" | "paid" | "refunded" | "failed";

export type PaymentMethodType = "cash" | "card" | "online";

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
}

export interface Order {
  id: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  paidAt?: string;
  paymentMethod: { name: string; type: string };
  appointment: {
    date: string;
    clientName: string;
    service: { name: string };
    barber: { name: string };
  };
}

/** Venta directa de producto (mostrador, sin appointment). */
export interface SaleRecord {
  id: string;
  soldAt: string;
  quantity: number;
  priceSnapshot: number;
  product: {
    name: string;
  };
  barber: {
    name: string;
  };
}
