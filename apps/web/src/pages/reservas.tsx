import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { StatusBadge } from "../components/statusBadge";
import { EmptyState } from "../components/ui/emptyState";
import { formatARS, formatDate, todayISO } from "../components/ui/formatters";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api } from "../lib/api";
import type { ApiResponse, Appointment, Barber } from "../types";

export default function Reservas() {
  const navigate = useNavigate();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(todayISO());
  const [selectedBarber, setSelectedBarber] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api<ApiResponse<Barber[]>>("barber?all=true").then((r) =>
      setBarbers(r?.data ?? []),
    );
  }, []);

  useEffect(() => {
    if (selectedBarber === "all") return;
    setLoading(true);
    api<ApiResponse<Appointment[]>>(
      `appointments?barberId=${selectedBarber}&date=${dateFrom}`,
    )
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

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="bg-surface border-border text-text-primary font-body rounded-xl border px-4 py-2.5 text-sm [color-scheme:dark] outline-none"
        />
        <select
          value={selectedBarber}
          onChange={(e) => setSelectedBarber(e.target.value)}
          className={`bg-surface border-border font-body flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none ${
            selectedBarber === "all" ? "text-text-muted" : "text-text-primary"
          }`}
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
          className="bg-surface border-border text-text-primary font-body flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none"
        />
      </div>

      {/* Lista */}
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
          <p className="text-text-muted font-body text-xs">
            {filtered.length} reserva{filtered.length !== 1 ? "s" : ""} —{" "}
            {formatDate(dateFrom)}
          </p>
          <div className="flex flex-col gap-2.5">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="card flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <div className="bg-marca/8 border-border flex size-12 shrink-0 flex-col items-center justify-center self-start rounded-xl border">
                  <span className="text-marca font-body text-xs font-bold">
                    {a.startTime}
                  </span>
                  <span className="text-text-muted font-body text-[10px]">
                    {a.endTime}
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-text-primary font-body text-sm font-bold">
                      {a.clientName}
                    </p>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-text-muted font-body text-xs">
                    {a.service?.name} · {a.clientPhone}
                  </p>
                  {a.notes && (
                    <p className="text-text-muted font-body text-xs italic">
                      "{a.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <span className="text-marca font-body text-sm font-bold">
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
