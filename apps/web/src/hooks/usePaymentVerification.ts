import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router";
import { getPaymentStatus } from "../lib/payment.api";
import type { PaymentStatus, PaymentViewState } from "../types/payment";

interface UsePaymentVerification {
  state: PaymentViewState;
  payment: PaymentStatus | null;
  /** Re-consulta el estado (útil para el botón "Actualizar" en pagos pendientes). */
  refresh: () => void;
}

/**
 * Lógica de la pantalla de verificación de pago.
 *
 * Flujo:
 *   1. MP redirige con query params: payment_id (o collection_id, su alias), etc.
 *   2. Consultamos la fuente de verdad al backend.
 *   3. Exponemos el estado de la UI ya listo para renderizar.
 */
export function usePaymentVerification(): UsePaymentVerification {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<PaymentViewState>("loading");
  const [payment, setPayment] = useState<PaymentStatus | null>(null);

  const paymentId =
    searchParams.get("payment_id") ?? searchParams.get("collection_id");

  const verify = useCallback(async () => {
    if (!paymentId) {
      toast.error("No se encontró el ID del pago");
      setState("error");
      return;
    }

    setState("loading");

    const res = await getPaymentStatus(paymentId); // null si falla (ver lib/api.ts)
    if (!res) {
      toast.error("Pago no registrado aún");
      setState("error");
      return;
    }

    setPayment(res.data);
    setState(res.data.status);
  }, [paymentId]);

  useEffect(() => {
    verify();
  }, [verify]);

  return { state, payment, refresh: verify };
}
