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
export interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  priceSnapshot: number;
  notes?: string;
  service: {
    name: string;
  };
  barber: {
    name: string;
  };
}
export default function Perfil() {
  const { user, logout } = useAuthStore();
  const openBooking = useBookingStore((s) => s.openModal);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  if (!user) return <Navigate to="/" replace />;
  useEffect(() => {
    api<{
      data: Appointment[];
    }>("appointments/my")
      .then((r) => setAppointments(r?.data ?? []))
      .finally(() => setLoading(false));
  }, []);
  const upcoming = appointments.filter((a) =>
    ["pending", "confirmed"].includes(a.status),
  );
  const history = appointments.filter((a) =>
    ["completed", "cancelled", "no_show"].includes(a.status),
  );
  return (
    <>
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6">
        {}
        <div
          className="card flex items-center gap-4"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-strong)",
          }}
        >
          <UserAvatar name={user.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p
              className="text-lg font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              {user.name}
            </p>
            <p
              className="text-sm"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              @{user.username} · {user.email}
            </p>
            {user.phone && (
              <p
                className="mt-0.5 text-xs"
                style={{
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {user.phone}
              </p>
            )}
          </div>
          <button
            onClick={logout}
            className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150"
            style={{
              background: "rgba(224,128,128,0.08)",
              color: "var(--color-error)",
              border: "1px solid rgba(224,128,128,0.15)",
              fontFamily: "var(--font-body)",
            }}
          >
            Salir
          </button>
        </div>

        {}
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
                        x.id === id
                          ? {
                              ...x,
                              status: "cancelled",
                            }
                          : x,
                      ),
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>

        {}
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
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    opacity: a.status === "cancelled" ? 0.55 : 1,
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: "var(--color-text-primary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {a.service?.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {formatDate(a.date)} · {a.startTime} · {a.barber?.name}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={a.status} />
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: "var(--color-marca)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
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
