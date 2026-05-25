import { PUBLIC_API_URL, PUBLIC_WEB_URL } from "@/constants/credentials.env";
import { payment } from "@/mercadopago/payment";
import { preference } from "@/mercadopago/preference";

/**
 * Docs: https://www.mercadopago.com.ar/developers/es/reference
 */

interface PreferenceItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number; // EN PESOS MP USA PESOS
}

interface CreatePreferenceParams {
  orderId: string;
  items: PreferenceItem[];
  payerEmail?: string;
  payerName?: string;
}

interface PreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

interface PaymentResponse {
  id: number;
  status:
    | "pending"
    | "approved"
    | "authorized"
    | "in_process"
    | "in_mediation"
    | "rejected"
    | "cancelled"
    | "refunded"
    | "charged_back";
  status_detail: string;
  external_reference: string;
  transaction_amount: number;
  date_approved: string | null;
}

export async function createPreference(
  params: CreatePreferenceParams,
): Promise<PreferenceResponse> {
  const response = await preference.create({
    body: {
      items: params.items.map((i) => ({
        ...i,
        unit_price: i.unit_price / 100,
      })),
      external_reference: params.orderId,
      notification_url: `${PUBLIC_API_URL}/api/v1/order/webhook/mp`,
      back_urls: {
        success: `${PUBLIC_WEB_URL}/payment-verification?payment=success`,
        failure: `${PUBLIC_WEB_URL}/payment-verification?payment=failure`,
        pending: `${PUBLIC_WEB_URL}/payment-verification?payment=pending`,
      },
      auto_return: "approved" as const,
      payer: params.payerEmail
        ? { email: params.payerEmail, name: params.payerName }
        : undefined,
      statement_descriptor: "Peko Barber",
    },
  });

  console.log({ response });

  if (!response) {
    throw new Error("Error al generar la preferencia en MP");
  }

  return {
    id: response.id!,
    init_point: response.init_point!,
    sandbox_init_point: response.sandbox_init_point!,
  };
}

export async function getPayment(paymentId: string): Promise<PaymentResponse> {
  const response = await payment.get({ id: paymentId });

  if (!response) {
    throw new Error("MP get payment error");
  }

  return {
    date_approved: response.date_approved!,
    external_reference: response.external_reference!,
    id: response.id!,
    status: response.status as
      | "pending"
      | "approved"
      | "authorized"
      | "in_process"
      | "in_mediation"
      | "rejected"
      | "cancelled"
      | "refunded"
      | "charged_back",
    status_detail: response.status_detail!,
    transaction_amount: response.transaction_amount!,
  };
}

export function mapPaymentStatus(
  mpStatus: PaymentResponse["status"],
): "paid" | "pending" | "failed" | "refunded" | null {
  switch (mpStatus) {
    case "approved":
    case "authorized":
      return "paid";
    case "pending":
    case "in_process":
    case "in_mediation":
      return "pending";
    case "rejected":
    case "cancelled":
      return "failed";
    case "refunded":
    case "charged_back":
      return "refunded";
    default:
      return null;
  }
}
