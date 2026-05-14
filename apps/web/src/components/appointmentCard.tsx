import { useState } from "react";
import { put } from "../lib/api";
import type { Appointment } from "../types";
import { StatusBadge } from "./statusBadge";
import { ConfirmModal } from "./ui/confirmModal";
import { formatARS, formatDate } from "./ui/formatters";

/**
 * Card del turno para vista de cliente (perfil → próximos turnos).
 * Jerarquía visual: hora prominente a la izquierda, servicio + barbero al
 * centro, precio + estado a la derecha. El botón de cancelar aparece como
 * acción secundaria abajo.
 */
export function AppointmentCard({
  appointment: a,
  onCancel,
}: {
  appointment: Appointment;
  onCancel: (id: string) => void;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleCancel() {
    setCancelling(true);
    try {
      await put(`appointments/${a.id}/status`, { status: "cancelled" });
      onCancel(a.id);
      setConfirmOpen(false);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      <article className="bg-surface border-border-strong hover:border-marca/30 flex flex-col gap-3 rounded-2xl border p-4 transition-colors duration-200 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {/* Bloque horario */}
            <div className="bg-marca/8 border-marca/20 flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border">
              <span className="text-marca font-display text-sm leading-none font-bold">
                {a.startTime}
              </span>
              <span className="text-text-muted font-body mt-0.5 text-[10px] leading-none">
                {a.endTime}
              </span>
            </div>
            {/* Info principal */}
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="font-display text-text-primary truncate text-base font-bold sm:text-lg">
                {a.service?.name}
              </p>
              <p className="text-text-secondary font-body text-xs sm:text-sm">
                {formatDate(a.date)} · con {a.barber?.name}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <StatusBadge status={a.status} />
            <p className="text-marca font-body text-sm font-bold tabular-nums">
              {formatARS(a.priceSnapshot)}
            </p>
          </div>
        </div>

        {a.notes && (
          <p className="text-text-muted bg-marca/4 border-border font-body rounded-lg border px-3 py-2 text-xs italic">
            "{a.notes}"
          </p>
        )}

        <button
          onClick={() => setConfirmOpen(true)}
          disabled={cancelling}
          className="bg-error/8 text-error border-error/15 hover:bg-error/12 font-body self-start rounded-lg border px-4 py-2 text-xs font-semibold transition-colors duration-150 disabled:opacity-50"
        >
          {cancelling ? "Cancelando..." : "Cancelar turno"}
        </button>
      </article>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleCancel}
        title="¿Cancelar este turno?"
        description={`Vas a cancelar tu turno del ${formatDate(a.date)} a las ${a.startTime}. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, cancelar turno"
        cancelLabel="No, mantener"
        variant="danger"
        loading={cancelling}
      />
    </>
  );
}
