import {
  cn,
  EmptyState,
  SectionHeader,
  Spinner,
  StatCard,
} from "@config/components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { StatusBadge } from "../components/statusBadge";
import {
  formatARS,
  formatDate,
  todayISO,
  todayISOArgentina,
} from "../components/ui/formatters";
import { api } from "../lib/api";
import { filterValidSlots } from "../lib/filterValidSlots";
import { timeToMinutes } from "../lib/timeTominutes";
import { useAuthStore } from "../store/useAuthStore";
import { useBookingStore } from "../store/useBookingStore";
import type { ApiResponse, Appointment, Slot } from "../types";
const QUICK_LINKS = [
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
];
export default function Dashboard() {
  const { serviceDuration, startTime, date } = useBookingStore();
  const user = useAuthStore((u) => u.user);
  const navigate = useNavigate();
  const today = todayISO();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawSlots, setRawSlots] = useState<Slot[]>([]);
  const [validSlots, setValidSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  useEffect(() => {
    api<ApiResponse<Appointment[]>>(`appointments?date=${today}&barberId=all`)
      .then((r) => setAppointments(r?.data ?? []))
      .finally(() => setLoading(false));
    api<ApiResponse<{ slots: Slot[] }>>(
      `availability?barberId=${user?.id}&date=${todayISO()}`,
    )
      .then((r) => {
        const slots = r?.data?.slots ?? [];
        setRawSlots(slots);
        setValidSlots(filterValidSlots(slots, serviceDuration));
      })
      .finally(() => setLoadingSlots(false));
  }, [today]);
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

  useEffect(() => {
    if (rawSlots.length > 0) {
      setValidSlots(filterValidSlots(rawSlots, serviceDuration));
    }
  }, [serviceDuration, rawSlots]);
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow={`Hoy · ${formatDate(today)}`}
        title="Resumen del día"
        description="Un vistazo rápido a cómo va la jornada."
      />

      <div>
        {validSlots && (
          <div>
            <label className="text-text-muted font-body mb-2 block text-xs font-semibold tracking-wide uppercase">
              Horario disponible
            </label>

            {loadingSlots ? (
              <div className="flex justify-center py-6">
                <Spinner size={20} />
              </div>
            ) : validSlots.length === 0 ? (
              <div className="border-border text-text-muted font-body rounded-xl border bg-black/20 px-4 py-5 text-center text-sm">
                ¡No quedan más horarios disponibles!
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {validSlots.map((s) => {
                    if (
                      timeToMinutes(s.startTime) <
                        new Date().getHours() * 60 + new Date().getMinutes() &&
                      date === todayISOArgentina()
                    ) {
                      return;
                    }
                    const selected = startTime === s.startTime;
                    return (
                      <button
                        key={s.startTime}
                        onClick={() => {}}
                        className={cn(
                          "font-body rounded-xl border py-2.5 text-sm font-semibold transition-all duration-150",
                          selected
                            ? "bg-marca/15 border-border-strong text-marca"
                            : "border-border text-text-secondary bg-black/20",
                        )}
                      >
                        {s.startTime}
                      </button>
                    );
                  })}
                </div>
                <p className="text-text-muted font-body mt-2 text-center text-xs">
                  Mostrando turnos disponibles
                </p>
              </>
            )}
          </div>
        )}
      </div>

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

      <div>
        <p className="text-text-muted font-body mb-3 text-xs font-bold tracking-widest uppercase">
          Accesos rápidos
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {QUICK_LINKS.map((item) => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className="bg-surface border-border text-text-secondary hover:border-border-strong hover:text-marca font-body flex items-center gap-2.5 rounded-xl border p-3.5 text-left text-sm font-semibold transition-all duration-150"
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-text-muted font-body text-xs font-bold tracking-widest uppercase">
            Próximos turnos
          </p>
          <button
            onClick={() => navigate("/admin/turnos")}
            className="text-marca font-body text-xs font-semibold"
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
            description="Todos los turnos están completados"
          />
        ) : (
          <div className="flex max-h-3/12 flex-col gap-4 overflow-y-scroll">
            {upcoming.map((a) => (
              <button
                key={a.id}
                onClick={() => navigate(`/admin/cierre/${a.id}`)}
                className="bg-surface border-border hover:border-border-strong flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-150"
              >
                <div className="bg-marca/8 border-border flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border">
                  <span className="text-marca font-body text-xs leading-none font-bold">
                    {a.startTime}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary font-body text-sm font-semibold">
                    {a.clientName}
                  </p>
                  <p className="text-text-muted font-body text-xs">
                    {a.service?.name} · {a.barber?.name}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </button>
            ))}
          </div>
        )}
        <div className="my-4 flex items-center justify-between">
          <p className="text-text-muted font-body text-xs font-bold tracking-widest uppercase">
            Todos los turnos de hoy
          </p>
        </div>
        <div className="flex max-h-3/12 flex-col gap-4 overflow-y-scroll">
          {appointments.length === 0 ? (
            <EmptyState
              icon="🎉"
              title="No hay turnos para hoy"
              description="Todo el día está libre"
            />
          ) : (
            appointments
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .slice(0, 5)
              .map((a) => (
                <button
                  key={a.id}
                  className="bg-surface border-border hover:border-border-strong flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-150"
                >
                  <div className="bg-marca/8 border-border flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border">
                    <span className="text-marca font-body text-xs leading-none font-bold">
                      {a.startTime}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-text-primary font-body text-sm font-semibold">
                      {a.clientName}
                    </p>
                    <p className="text-text-muted font-body text-xs">
                      {a.service?.name} · {a.barber?.name}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </button>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
