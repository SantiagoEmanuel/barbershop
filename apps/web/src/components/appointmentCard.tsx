import { useState } from "react";
import { put } from "../lib/api";
import type { Appointment } from "../pages/profile";
import { StatusBadge } from "./statusBadge";
import { formatARS, formatDate } from "./ui/formatters";

export function AppointmentCard({
  appointment: a,
  onCancel,
}: {
  appointment: Appointment;
  onCancel: (id: string) => void;
}) {
  const [cancelling, setCancelling] = useState(false);

  async function handleCancel() {
    if (!confirm("¿Cancelar este turno?")) return;
    setCancelling(true);
    try {
      await put(`appointments/${a.id}/status`, { status: "cancelled" });
      onCancel(a.id);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div
      className="card flex flex-col gap-3"
      style={{ border: "1px solid var(--color-border-strong)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="font-bold"
            style={{
              color: "var(--color-marca)",
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
            }}
          >
            {a.service?.name}
          </p>
          <p
            className="mt-0.5 text-sm"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-body)",
            }}
          >
            {formatDate(a.date)} · {a.startTime}–{a.endTime}
          </p>
          <p
            className="mt-0.5 text-xs"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Con {a.barber?.name}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <StatusBadge status={a.status} />
          <p
            className="mt-1 text-sm font-bold"
            style={{
              color: "var(--color-marca)",
              fontFamily: "var(--font-body)",
            }}
          >
            {formatARS(a.priceSnapshot)}
          </p>
        </div>
      </div>
      {a.notes && (
        <p
          className="text-xs italic"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          "{a.notes}"
        </p>
      )}
      <button
        onClick={handleCancel}
        disabled={cancelling}
        className="self-start rounded-lg px-4 py-2 text-xs font-semibold transition-colors duration-150"
        style={{
          background: "rgba(224,128,128,0.08)",
          color: "var(--color-error)",
          border: "1px solid rgba(224,128,128,0.15)",
          fontFamily: "var(--font-body)",
          opacity: cancelling ? 0.5 : 1,
        }}
      >
        {cancelling ? "Cancelando..." : "Cancelar turno"}
      </button>
    </div>
  );
}
