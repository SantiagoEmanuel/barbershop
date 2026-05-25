import type { PaymentStatus } from "../../types/payment";
import { formatARS } from "../ui/formatters";
const shortId = (id: string | number) =>
  `#${String(id).slice(0, 8).toUpperCase()}`;
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
function Row({
  label,
  value,
  emphasis = false,
  last = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-3 ${last ? "" : "border-border border-b"}`}
    >
      <span className="text-text-muted font-body text-sm">{label}</span>
      <span
        className={
          emphasis
            ? "font-display text-text-primary text-lg font-bold tabular-nums"
            : "text-text-secondary font-body text-sm font-medium tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}

export function PaymentDetails({ payment }: { payment: PaymentStatus }) {
  return (
    <div className="bg-surface-2 border-border mt-7 w-full rounded-xl border px-5 text-left">
      {payment.externalReference && (
        <Row label="Orden" value={shortId(payment.externalReference)} />
      )}
      <Row label="Importe" value={formatARS(payment.amount)} emphasis />
      <Row label="N° de pago" value={shortId(payment.paymentId)} />
      {payment.paidAt && (
        <Row label="Acreditado" value={fmtDateTime(payment.paidAt)} last />
      )}
    </div>
  );
}
