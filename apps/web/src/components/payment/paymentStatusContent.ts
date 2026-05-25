import type { PaymentViewState } from "../../types/payment";

interface StatusContent {
  title: string;
  subtitle: string;
  iconText: string;
  iconBg: string;
}
export const PAYMENT_STATUS_CONTENT: Record<
  Exclude<PaymentViewState, "loading">,
  StatusContent
> = {
  paid: {
    title: "Pago confirmado",
    subtitle: "Tu turno quedó reservado. Te esperamos en Peko Barber.",
    iconText: "text-success",
    iconBg: "bg-success/10",
  },
  pending: {
    title: "Pago en proceso",
    subtitle:
      "Estamos esperando la confirmación. Apenas se acredite, tu turno queda asegurado.",
    iconText: "text-warning",
    iconBg: "bg-warning/10",
  },
  failed: {
    title: "El pago no se completó",
    subtitle: "No se realizó ningún cargo. Podés intentarlo nuevamente.",
    iconText: "text-error",
    iconBg: "bg-error/10",
  },
  refunded: {
    title: "Pago reembolsado",
    subtitle: "El importe fue devuelto a tu medio de pago.",
    iconText: "text-text-secondary",
    iconBg: "bg-surface-2",
  },
  error: {
    title: "No pudimos verificar el pago",
    subtitle: "Si ya pagaste, revisá tu perfil en unos minutos o escribinos.",
    iconText: "text-text-muted",
    iconBg: "bg-surface-2",
  },
};
