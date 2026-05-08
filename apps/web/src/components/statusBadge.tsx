import type { AppointmentStatus } from "../types";

/**
 * Mapeo único de status → estilo. Las clases usan tokens del tema
 * (success/warning/error + text-muted) para que respete dark/light.
 */
const STATUS_MAP: Record<
  AppointmentStatus,
  { label: string; classes: string }
> = {
  pending: {
    label: "Pendiente",
    classes: "text-warning bg-warning/12",
  },
  confirmed: {
    label: "Confirmado",
    classes: "text-success bg-success/12",
  },
  completed: {
    label: "Completado",
    classes: "text-text-muted bg-text-muted/12",
  },
  cancelled: {
    label: "Cancelado",
    classes: "text-error bg-error/12",
  },
  no_show: {
    label: "No se presentó",
    classes: "text-error bg-error/8",
  },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return (
    <span
      className={`font-body inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.classes}`}
    >
      {s.label}
    </span>
  );
}
