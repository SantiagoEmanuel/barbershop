import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { StatCard } from "../components/statCard";
import { StatusBadge } from "../components/statusBadge";
import { EmptyState } from "../components/ui/emptyState";
import { formatARS, formatDate, todayISO } from "../components/ui/formatters";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api } from "../lib/api";
interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  priceSnapshot: number;
  service: {
    name: string;
    durationMinutes: number;
  };
  barber: {
    name: string;
  };
}
interface ApiResponse<T> {
  data: T;
  message: string;
}
export default function Dashboard() {
  const navigate = useNavigate();
  const today = todayISO();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<ApiResponse<Appointment[]>>(`appointments?date=${today}&barberId=all`)
      .then((r) => setAppointments(r?.data ?? []))
      .finally(() => setLoading(false));
  }, []);
  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    revenue: appointments
      .filter((a) => a.status === "completed")
      .reduce((acc, a) => acc + a.priceSnapshot, 0),
  };
  const upcoming = appointments
    .filter((a) => ["pending", "confirmed"].includes(a.status))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 5);
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow={`Hoy · ${formatDate(today)}`}
        title="Resumen del día"
        description="Un vistazo rápido a cómo va la jornada."
      />

      {}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Turnos hoy" value={stats.total} icon="📋" />
        <StatCard label="Pendientes" value={stats.pending} icon="⏳" />
        <StatCard label="Completados" value={stats.completed} icon="✓" />
        <StatCard
          label="Facturado hoy"
          value={formatARS(stats.revenue)}
          icon="💰"
          accent
        />
      </div>

      {}
      <div>
        <p
          className="mb-3 text-xs font-bold tracking-widest uppercase"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          Accesos rápidos
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {[
            {
              label: "Ver turnos del día",
              href: "/admin/turnos",
              icon: "📅",
            },
            {
              label: "Nueva reserva",
              href: "/admin/reservas",
              icon: "➕",
            },
            {
              label: "Registrar venta",
              href: "/admin/ventas",
              icon: "🛒",
            },
            {
              label: "Ver movimientos",
              href: "/admin/movimientos",
              icon: "📈",
            },
            {
              label: "Editar servicios",
              href: "/admin/servicios",
              icon: "✂️",
            },
            {
              label: "Gestionar barberos",
              href: "/admin/barberos",
              icon: "👤",
            },
          ].map((item) => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className="flex items-center gap-2.5 rounded-xl p-3.5 text-left text-sm font-semibold transition-all duration-150"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-body)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "var(--color-border-strong)";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--color-marca)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "var(--color-border)";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--color-text-secondary)";
              }}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Próximos turnos
          </p>
          <button
            onClick={() => navigate("/admin/turnos")}
            className="text-xs font-semibold"
            style={{
              color: "var(--color-marca)",
              fontFamily: "var(--font-body)",
            }}
          >
            Ver todos →
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size={24} />
          </div>
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="No hay turnos pendientes"
            description="Todo el día está libre o completado."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map((a) => (
              <button
                key={a.id}
                onClick={() => navigate(`/admin/cierre/${a.id}`)}
                className="flex w-full items-center gap-3 rounded-xl p-3.5 text-left transition-all duration-150"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "var(--color-border-strong)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "var(--color-border)";
                }}
              >
                <div
                  className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl"
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
                    {a.service?.name} · {a.barber?.name}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
