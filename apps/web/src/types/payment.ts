import type { OrderStatus } from "./order";

/**
 * Estado de la pantalla de verificación de pago.
 * Reutiliza OrderStatus (pending | paid | refunded | failed) y le suma dos
 * estados propios de la UI:
 *   - "loading": consultando el estado al backend
 *   - "error":   no se pudo verificar (sin payment_id, fetch falló, etc.)
 */
export type PaymentViewState = OrderStatus | "loading" | "error";

/**
 * Respuesta normalizada de GET /mercadopago/payment-status/:id
 *
 * El backend toma el pago crudo de MercadoPago (getPayment) y lo normaliza
 * a las convenciones de la app antes de responder:
 *   - `status`: ya mapeado a OrderStatus con mapPaymentStatus (NO el raw de MP)
 *   - `amount`: en CENTAVOS, igual que orders.amount en la DB
 *               (importante: formatARS espera centavos; MP devuelve pesos,
 *                así que el endpoint debe multiplicar transaction_amount * 100)
 */
export interface PaymentStatus {
  paymentId: string;
  status: OrderStatus;
  amount: number; // centavos
  externalReference: string | null;
  paidAt: string | null; // ISO o null
}
