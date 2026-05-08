type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";
const STATUS_MAP: Record<
  AppointmentStatus,
  {
    label: string;
    color: string;
    bg: string;
  }
> = {
  pending: {
    label: "Pendiente",
    color: "#E6B96A",
    bg: "rgba(230,185,106,0.12)",
  },
  confirmed: {
    label: "Confirmado",
    color: "#86C586",
    bg: "rgba(134,197,134,0.12)",
  },
  completed: {
    label: "Completado",
    color: "#8B8899",
    bg: "rgba(139,136,153,0.12)",
  },
  cancelled: {
    label: "Cancelado",
    color: "#E08080",
    bg: "rgba(224,128,128,0.12)",
  },
  no_show: {
    label: "No se presentó",
    color: "#E08080",
    bg: "rgba(224,128,128,0.08)",
  },
};
export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{
        color: s.color,
        background: s.bg,
        fontFamily: "var(--font-body)",
      }}
    >
      {s.label}
    </span>
  );
}
