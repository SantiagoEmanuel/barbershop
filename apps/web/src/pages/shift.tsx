import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { StatusBadge } from "../components/statusBadge";
import { EmptyState } from "../components/ui/emptyState";
import { formatARS, todayISO } from "../components/ui/formatters";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api, put } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
interface Barber {
  id: string;
  name: string;
  slug: string;
}
interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  priceSnapshot: number;
  notes?: string;
  service: {
    name: string;
    durationMinutes: number;
  };
  barber: {
    id: string;
    name: string;
  };
}
type AppStatus = Appointment["status"];
const STATUS_OPTIONS: {
  value: AppStatus | "all";
  label: string;
}[] = [
  {
    value: "all",
    label: "Todos",
  },
  {
    value: "pending",
    label: "Pendientes",
  },
  {
    value: "confirmed",
    label: "Confirmados",
  },
  {
    value: "completed",
    label: "Completados",
  },
  {
    value: "cancelled",
    label: "Cancelados",
  },
  {
    value: "no_show",
    label: "No se presentó",
  },
];
export default function Turnos() {
  const user = useAuthStore((u) => u.user);
  const navigate = useNavigate();
  const [date, setDate] = useState(todayISO());
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>(
    user ? user.id : "all",
  );
  const [statusFilter, setStatusFilter] = useState<AppStatus | "all">("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    api<{
      data: Barber[];
    }>("barber?all=true").then((r) => setBarbers(r?.data ?? []));
  }, []);
  useEffect(() => {
    if (!date || selectedBarber === "all") return;
    setLoading(true);
    api<{
      data: Appointment[];
    }>(`appointments?barberId=${selectedBarber}&date=${date}`)
      .then((r) => setAppointments(r?.data ?? []))
      .finally(() => setLoading(false));
  }, [date, selectedBarber]);
  async function changeStatus(id: string, status: AppStatus) {
    const res = await put(`appointments/${id}/status`, {
      status,
    });
    if (res) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status,
              }
            : a,
        ),
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

      {}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-body)",
            colorScheme: "dark",
          }}
        />
        <select
          value={selectedBarber}
          onChange={(e) => setSelectedBarber(e.target.value)}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color:
              selectedBarber === "all"
                ? "var(--color-text-muted)"
                : "var(--color-text-primary)",
            fontFamily: "var(--font-body)",
          }}
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
          onChange={(e) => setStatusFilter(e.target.value as AppStatus | "all")}
          className="rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-body)",
          }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {}
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
            <AppointmentCard
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
function AppointmentCard({
  appointment: a,
  onChangeStatus,
  onClose,
}: {
  appointment: Appointment;
  onChangeStatus: (id: string, status: Appointment["status"]) => void;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const nextStatus: Record<
    string,
    {
      label: string;
      value: Appointment["status"];
    } | null
  > = {
    pending: {
      label: "Confirmar",
      value: "confirmed",
    },
    confirmed: {
      label: "Completar",
      value: "completed",
    },
    completed: null,
    cancelled: null,
    no_show: null,
  };
  const next = nextStatus[a.status];
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      {}
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl text-center"
          style={{
            background: "rgba(248,223,176,0.08)",
            border: "1px solid var(--color-border)",
          }}
        >
          <span
            className="text-xs leading-none font-bold"
            style={{
              color: "var(--color-marca)",
              fontFamily: "var(--font-body)",
            }}
          >
            {a.startTime}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-semibold"
            style={{
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            {a.clientName}
          </p>
          <p
            className="text-xs"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            {a.service?.name} · {a.startTime}–{a.endTime}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={a.status} />
          <span
            style={{
              color: "var(--color-text-muted)",
              fontSize: 12,
            }}
          >
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {}
      {expanded && (
        <div
          className="flex flex-col gap-3 px-4 pt-1 pb-4"
          style={{
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <div
            className="grid grid-cols-2 gap-2 text-xs"
            style={{
              fontFamily: "var(--font-body)",
            }}
          >
            <div>
              <p
                style={{
                  color: "var(--color-text-muted)",
                }}
              >
                Teléfono
              </p>
              <p
                style={{
                  color: "var(--color-text-primary)",
                }}
              >
                {a.clientPhone}
              </p>
            </div>
            <div>
              <p
                style={{
                  color: "var(--color-text-muted)",
                }}
              >
                Precio
              </p>
              <p
                style={{
                  color: "var(--color-marca)",
                  fontWeight: 600,
                }}
              >
                {formatARS(a.priceSnapshot)}
              </p>
            </div>
            {a.notes && (
              <div className="col-span-2">
                <p
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                >
                  Notas
                </p>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {a.notes}
                </p>
              </div>
            )}
          </div>

          {}
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
                className="rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-150"
                style={{
                  background: "rgba(224,128,128,0.1)",
                  border: "1px solid rgba(224,128,128,0.2)",
                  color: "var(--color-error)",
                  fontFamily: "var(--font-body)",
                }}
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
