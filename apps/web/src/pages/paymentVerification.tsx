import { Spinner } from "@config/components";
import { PaymentActions } from "../components/payment/paymentActions";
import { PaymentCard } from "../components/payment/paymentCard";
import { PaymentDetails } from "../components/payment/paymentDetails";
import { PAYMENT_STATUS_CONTENT } from "../components/payment/paymentStatusContent";
import { PaymentStatusIcon } from "../components/payment/paymentStatusIcon";
import { usePaymentVerification } from "../hooks/usePaymentVerification";

export default function PaymentVerification() {
  const { state, payment, refresh } = usePaymentVerification();

  if (state === "loading") {
    return (
      <PaymentCard>
        <div className="flex flex-col items-center">
          <div className="bg-marca-subtle mb-6 flex h-24 w-24 items-center justify-center rounded-full">
            <Spinner size={32} />
          </div>
          <h1 className="font-display text-text-primary text-3xl font-bold">
            Verificando tu pago
          </h1>
          <p className="text-text-secondary font-body mx-auto mt-2.5 max-w-xs text-sm leading-relaxed">
            Estamos confirmando la operación con MercadoPago…
          </p>
        </div>
      </PaymentCard>
    );
  }

  const content = PAYMENT_STATUS_CONTENT[state];
  const showDetails = payment && state !== "error";

  return (
    <PaymentCard>
      <div className="flex flex-col items-center">
        <div
          className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full ${content.iconBg} ${content.iconText}`}
        >
          <PaymentStatusIcon state={state} />
        </div>

        <h1 className="font-display text-text-primary text-3xl font-bold">
          {content.title}
        </h1>
        <p className="text-text-secondary font-body mx-auto mt-2.5 max-w-xs text-sm leading-relaxed">
          {content.subtitle}
        </p>

        {showDetails && <PaymentDetails payment={payment} />}

        <PaymentActions state={state} onRefresh={refresh} />
      </div>
    </PaymentCard>
  );
}
