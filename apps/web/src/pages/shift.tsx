import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { StatusBadge } from "../components/statusBadge";
import { EmptyState } from "../components/ui/emptyState";
import { formatARS, todayISO } from "../components/ui/formatters";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api, put } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import type {
  ApiResponse,
  Appointment,
  AppointmentStatus,
  Barber,
} from "../types";

const STATUS_OPTIONS: { value: AppointmentStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "confirmed", label: "Confirmados" },
  { value: "completed", label: "Completados" },
  { value: "cancelled", label: "Cancelados" },
  { value: "no_show", label: "No se presentó" },
];

export default function Turnos() {
  const user = useAuthStore((u) => u.user);
  const navigate = useNavigate();
  const [date, setDate] = useState(todayISO());
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>(
    user ? user.id : "all",
  );
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">(
    "all",
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<ApiResponse<Barber[]>>("barber?all=true").then((r) =>
      setBarbers(r?.data ?? []),
    );
  }, []);

  useEffect(() => {
    if (!date || selectedBarber === "all") return;
    setLoading(true);
    api<ApiResponse<Appointment[]>>(
      `appointments?barberId=${selectedBarber}&date=${date}`,
    )
      .then((r) => setAppointments(r?.data ?? []))
      .finally(() => setLoading(false));
  }, [date, selectedBarber]);

  async function changeStatus(id: string, status: AppointmentStatus) {
    const res = await put(`appointments/${id}/status`, { status });
    if (res) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
      );
    }
  }

  const filtered = appointments.filter((a) =>
    statusFilter === "all" ? true : a.status === statusFilter,
  );

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow="Admin"
        title="Turnos del día"
        description="Gestioná y actualizá el estado de cada turno."
      />

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-surface border-border text-text-primary font-body rounded-xl border px-4 py-2.5 text-sm scheme-dark outline-none"
        />
        <select
          value={selectedBarber}
          onChange={(e) => setSelectedBarber(e.target.value)}
          className={`bg-surface border-border font-body flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none ${
            selectedBarber === "all" ? "text-text-muted" : "text-text-primary"
          }`}
        >
          <option value="all">Seleccioná un barbero</option>
          {barbers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as AppointmentStatus | "all")
          }
          className="bg-surface border-border text-text-primary font-body rounded-xl border px-4 py-2.5 text-sm outline-none"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {selectedBarber === "all" ? (
        <EmptyState
          icon="☝️"
          title="Seleccioná un barbero"
          description="Elegí un barbero arriba para ver sus turnos del día."
        />
      ) : loading ? (
        <div className="flex justify-center py-12">
          <Spinner size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📭"
          title="Sin turnos"
          description="No hay turnos con ese filtro para esta fecha."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((a) => (
            <ShiftAppointmentCard
              key={a.id}
              appointment={a}
              onChangeStatus={changeStatus}
              onClose={() => navigate(`/admin/cierre/${a.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Card local del turno (con expand y acciones inline) ──────
const NEXT_STATUS: Record<
  AppointmentStatus,
  { label: string; value: AppointmentStatus } | null
> = {
  pending: { label: "Confirmar", value: "confirmed" },
  confirmed: { label: "Completar", value: "completed" },
  completed: null,
  cancelled: null,
  no_show: null,
};

function ShiftAppointmentCard({
  appointment: a,
  onChangeStatus,
  onClose,
}: {
  appointment: Appointment;
  onChangeStatus: (id: string, status: AppointmentStatus) => void;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const next = NEXT_STATUS[a.status];

  return (
    <div className="bg-surface border-border overflow-hidden rounded-xl border">
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="bg-marca/8 border-border flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border text-center">
          <span className="text-marca font-body text-xs leading-none font-bold">
            {a.startTime}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-text-primary font-body text-sm font-semibold">
            {a.clientName}
          </p>
          <p className="text-text-muted font-body text-xs">
            {a.service?.name} · {a.startTime}–{a.endTime}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={a.status} />
          <span className="text-text-muted text-xs">
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="border-border flex flex-col gap-3 border-t px-4 pt-3 pb-4">
          <div className="font-body grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-text-muted">Teléfono</p>
              <p className="text-text-primary">{a.clientPhone}</p>
            </div>
            <div>
              <p className="text-text-muted">Precio</p>
              <p className="text-marca font-semibold">
                {formatARS(a.priceSnapshot)}
              </p>
            </div>
            {a.notes && (
              <div className="col-span-2">
                <p className="text-text-muted">Notas</p>
                <p className="text-text-secondary">{a.notes}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {next && (
              <button
                onClick={() => onChangeStatus(a.id, next.value)}
                className="btn-marca rounded-lg px-4 py-2 text-xs"
              >
                {next.label}
              </button>
            )}
            {a.status !== "cancelled" && a.status !== "completed" && (
              <button
                onClick={() => onChangeStatus(a.id, "no_show")}
                className="bg-error/10 border-error/20 text-error font-body rounded-lg border px-4 py-2 text-xs font-semibold transition-all duration-150"
              >
                No se presentó
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-ghost ml-auto rounded-lg px-4 py-2 text-xs"
            >
              Cerrar servicio →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
