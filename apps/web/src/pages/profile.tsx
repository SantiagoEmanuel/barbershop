import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { AppointmentCard } from "../components/appointmentCard";
import BookingModal from "../components/bookingModal";
import { StatusBadge } from "../components/statusBadge";
import { UserAvatar } from "../components/ui/avatar";
import { EmptyState } from "../components/ui/emptyState";
import { formatARS, formatDate } from "../components/ui/formatters";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import { useBookingStore } from "../store/useBookingStore";
import type { ApiResponse, Appointment } from "../types";

export default function Perfil() {
  const { user, logout } = useAuthStore();
  const openBooking = useBookingStore((s) => s.openModal);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Hooks ANTES del early return — no violar las reglas de hooks.
  useEffect(() => {
    if (!user) return;
    api<ApiResponse<Appointment[]>>("appointments/my")
      .then((r) => setAppointments(r?.data ?? []))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <Navigate to="/" replace />;

  const upcoming = appointments.filter((a) =>
    ["pending", "confirmed"].includes(a.status),
  );
  const history = appointments.filter((a) =>
    ["completed", "cancelled", "no_show"].includes(a.status),
  );

  return (
    <>
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6">
        {/* Header de perfil */}
        <div className="card bg-surface border-border-strong flex items-center gap-4 border">
          <UserAvatar name={user.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-text-primary text-lg font-bold">
              {user.name}
            </p>
            <p className="text-text-muted font-body text-sm">
              @{user.username} · {user.email}
            </p>
            {user.phone && (
              <p className="text-text-muted font-body mt-0.5 text-xs">
                {user.phone}
              </p>
            )}
          </div>
          <button
            onClick={logout}
            className="bg-error/8 text-error border-error/15 font-body shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors duration-150"
          >
            Salir
          </button>
        </div>

        {/* Próximos turnos */}
        <div>
          <SectionHeader
            eyebrow="Mis turnos"
            title="Próximas visitas"
            action={
              <button
                onClick={openBooking}
                className="btn-marca rounded-xl px-4 py-2 text-sm"
              >
                + Nuevo turno
              </button>
            }
          />
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size={24} />
            </div>
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No tenés turnos próximos"
              description="¿Cuándo fue la última vez que te cortaste? Ya es hora."
              action={
                <button
                  onClick={openBooking}
                  className="btn-marca rounded-xl px-6 py-2.5 text-sm"
                >
                  Sacar turno
                </button>
              }
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {upcoming.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  onCancel={(id) =>
                    setAppointments((prev) =>
                      prev.map((x) =>
                        x.id === id ? { ...x, status: "cancelled" } : x,
                      ),
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Historial */}
        {history.length > 0 && (
          <div>
            <SectionHeader
              title="Historial"
              description="Tus visitas anteriores."
            />
            <div className="flex flex-col gap-2">
              {history.slice(0, 8).map((a) => (
                <div
                  key={a.id}
                  className={`bg-surface border-border flex items-center gap-3 rounded-xl border px-4 py-3 ${
                    a.status === "cancelled" ? "opacity-55" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-text-primary font-body text-sm font-semibold">
                      {a.service?.name}
                    </p>
                    <p className="text-text-muted font-body text-xs">
                      {formatDate(a.date)} · {a.startTime} · {a.barber?.name}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={a.status} />
                    <span className="text-marca font-body text-sm font-bold">
                      {formatARS(a.priceSnapshot)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BookingModal />
    </>
  );
}
