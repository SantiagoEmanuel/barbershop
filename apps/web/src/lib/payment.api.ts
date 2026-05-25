import type { ApiResponse } from "../types";
import type { PaymentStatus } from "../types/payment";

import { api } from "./api";
export function getPaymentStatus(paymentId: string) {
  return api<ApiResponse<PaymentStatus>>(
    `mercadopago/payment-status/${paymentId}`,
  );
}
