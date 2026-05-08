import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { StatusBadge } from "../components/statusBadge";
import { EmptyState } from "../components/ui/emptyState";
import { formatARS, formatDate, todayISO } from "../components/ui/formatters";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api } from "../lib/api";
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
export default function Reservas() {
  const navigate = useNavigate();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(todayISO());
  const [selectedBarber, setSelectedBarber] = useState("all");
  const [search, setSearch] = useState("");
  useEffect(() => {
    api<{
      data: Barber[];
    }>("barber?all=true").then((r) => setBarbers(r?.data ?? []));
  }, []);
  useEffect(() => {
    if (selectedBarber === "all") return;
    setLoading(true);
    api<{
      data: Appointment[];
    }>(`appointments?barberId=${selectedBarber}&date=${dateFrom}`)
      .then((r) => setAppointments(r?.data ?? []))
      .finally(() => setLoading(false));
  }, [dateFrom, selectedBarber]);
  const filtered = appointments.filter((a) =>
    search.trim() === ""
      ? true
      : a.clientName.toLowerCase().includes(search.toLowerCase()) ||
        a.clientPhone.includes(search),
  );
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow="Admin"
        title="Reservas"
        description="Consultá reservas por barbero y fecha."
        action={
          <button
            onClick={() => navigate("/admin/turnos")}
            className="btn-marca rounded-xl px-4 py-2 text-sm"
          >
            + Nuevo turno
          </button>
        }
      />

      {}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
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
          <option value="all">Todos los barberos</option>
          {barbers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-body)",
          }}
        />
      </div>

      {}
      {selectedBarber === "all" ? (
        <EmptyState
          icon="☝️"
          title="Seleccioná un barbero"
          description="Elegí un barbero para ver sus reservas."
        />
      ) : loading ? (
        <div className="flex justify-center py-12">
          <Spinner size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📭"
          title="Sin reservas"
          description="No hay reservas que coincidan con los filtros."
        />
      ) : (
        <>
          <p
            className="text-xs"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            {filtered.length} reserva{filtered.length !== 1 ? "s" : ""} —{" "}
            {formatDate(dateFrom)}
          </p>
          <div className="flex flex-col gap-2.5">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="card flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                {}
                <div
                  className="flex size-12 shrink-0 flex-col items-center justify-center self-start rounded-xl"
                  style={{
                    background: "rgba(248,223,176,0.08)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: "var(--color-marca)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {a.startTime}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {a.endTime}
                  </span>
                </div>

                {}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className="text-sm font-bold"
                      style={{
                        color: "var(--color-text-primary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {a.clientName}
                    </p>
                    <StatusBadge status={a.status} />
                  </div>
                  <p
                    className="text-xs"
                    style={{
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {a.service?.name} · {a.clientPhone}
                  </p>
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
                </div>

                {}
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: "var(--color-marca)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {formatARS(a.priceSnapshot)}
                  </span>
                  {["pending", "confirmed"].includes(a.status) && (
                    <button
                      onClick={() => navigate(`/admin/cierre/${a.id}`)}
                      className="btn-ghost rounded-lg px-3 py-1.5 text-xs"
                    >
                      Cerrar →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
