import { useState } from "react";
import { put } from "../lib/api";
import type { Appointment } from "../types";
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
    <div className="card border-border-strong flex flex-col gap-3 border">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-marca font-display text-base font-bold">
            {a.service?.name}
          </p>
          <p className="text-text-secondary font-body mt-0.5 text-sm">
            {formatDate(a.date)} · {a.startTime}–{a.endTime}
          </p>
          <p className="text-text-muted font-body mt-0.5 text-xs">
            Con {a.barber?.name}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <StatusBadge status={a.status} />
          <p className="text-marca font-body mt-1 text-sm font-bold">
            {formatARS(a.priceSnapshot)}
          </p>
        </div>
      </div>
      {a.notes && (
        <p className="text-text-muted font-body text-xs italic">"{a.notes}"</p>
      )}
      <button
        onClick={handleCancel}
        disabled={cancelling}
        className="bg-error/8 text-error border-error/15 font-body self-start rounded-lg border px-4 py-2 text-xs font-semibold transition-colors duration-150 disabled:opacity-50"
      >
        {cancelling ? "Cancelando..." : "Cancelar turno"}
      </button>
    </div>
  );
}
