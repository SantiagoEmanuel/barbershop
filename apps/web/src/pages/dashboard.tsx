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
import { useBookingStore } from "../store/useBookingStore";
import type {
  ApiResponse,
  Appointment,
  Barber,
  Order,
  ReportSummary,
  Slot,
} from "../types";
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
    label: "Inventario",
    href: "/admin/inventario",
    icon: "📦",
  },
  {
    label: "Rendimientos",
    href: "/admin/rendimientos",
    icon: "🏆",
  },
  {
    label: "Registrar gasto",
    href: "/admin/egresos",
    icon: "🧾",
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

/** Tarjeta de balance clickeable que navega al detalle (ingresos/egresos). */
function BalanceCard({
  label,
  value,
  icon,
  tone,
  onClick,
}: {
  label: string;
  value: string;
  icon: string;
  tone: "income" | "expense" | "balance";
  onClick?: () => void;
}) {
  const toneClass =
    tone === "income"
      ? "text-success"
      : tone === "expense"
        ? "text-error"
        : "text-marca";
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "border-border bg-surface group relative flex flex-col gap-1.5 rounded-2xl border p-4 text-left transition-colors duration-200 sm:p-5",
        onClick && "hover:border-border-strong cursor-pointer",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-text-muted font-body truncate text-[10px] font-bold tracking-[0.12em] uppercase sm:text-xs">
          {label}
        </p>
        <span aria-hidden className="text-base opacity-70 sm:text-lg">
          {icon}
        </span>
      </div>
      <p
        className={cn(
          "font-display truncate text-2xl leading-none font-bold tabular-nums sm:text-3xl",
          toneClass,
        )}
      >
        {value}
      </p>
      {onClick && (
        <p className="text-text-muted font-body group-hover:text-marca text-xs transition-colors">
          Ver detalle →
        </p>
      )}
    </Wrapper>
  );
}
export default function Dashboard() {
  const { serviceDuration, startTime, date } = useBookingStore();
  const navigate = useNavigate();
  const today = todayISO();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawSlots, setRawSlots] = useState<Slot[]>([]);
  const [validSlots, setValidSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [linkedBarberId, setLinkedBarberId] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  useEffect(() => {
    api<ApiResponse<ReportSummary>>("reports/summary").then((r) =>
      setSummary(r?.data ?? null),
    );
    // Órdenes del día: incluyen servicios cobrados y ventas de productos,
    // así "Facturado hoy" refleja la facturación real (no solo servicios).
    api<ApiResponse<Order[]>>(`order?date=${today}`).then((r) =>
      setTodayOrders(r?.data ?? []),
    );
    api<ApiResponse<Appointment[]>>(`appointments?date=${today}&barberId=all`)
      .then((r) => setAppointments(r?.data ?? []))
      .finally(() => setLoading(false));
    // El usuario logueado puede o no tener un perfil de barbero vinculado.
    // El id del barbero NO es el id del usuario: lo resolvemos por el vínculo.
    api<ApiResponse<Barber | null>>("barber/me")
      .then((r) => {
        const barberId = r?.data?.id ?? null;
        setLinkedBarberId(barberId);
        if (!barberId) {
          setLoadingSlots(false);
          return;
        }
        return api<ApiResponse<{ slots: Slot[] }>>(
          `availability?barberId=${barberId}&date=${todayISO()}`,
        )
          .then((res) => {
            const slots = res?.data?.slots ?? [];
            setRawSlots(slots);
            setValidSlots(filterValidSlots(slots, serviceDuration));
          })
          .finally(() => setLoadingSlots(false));
      })
      .catch(() => setLoadingSlots(false));
  }, [today]);
  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    // Facturado real del día: suma de órdenes pagas (servicios + productos).
    revenue: todayOrders
      .filter((o) => o.status === "paid")
      .reduce((acc, o) => acc + o.amount, 0),
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

      {/* Balance del mes — ingresos, egresos y resultado */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-text-muted font-body text-xs font-bold tracking-widest uppercase">
            Balance del mes
          </p>
          <button
            onClick={() => navigate("/admin/rendimientos")}
            className="text-marca font-body text-xs font-semibold"
          >
            Ver rendimientos →
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <BalanceCard
            label="Balance"
            tone="balance"
            icon="⚖️"
            value={formatARS(summary?.balance ?? 0)}
          />
          <BalanceCard
            label="Ingresos"
            tone="income"
            icon="📈"
            value={formatARS(summary?.income ?? 0)}
            onClick={() => navigate("/admin/ingresos")}
          />
          <BalanceCard
            label="Egresos"
            tone="expense"
            icon="📉"
            value={formatARS(summary?.expenses ?? 0)}
            onClick={() => navigate("/admin/egresos")}
          />
        </div>
      </div>

      <div>
        {linkedBarberId && (
          <div>
            <label className="text-text-muted font-body mb-2 block text-xs font-semibold tracking-wide uppercase">
              Tu horario disponible hoy
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
                      <div
                        key={s.startTime}
                        className={cn(
                          "font-body rounded-xl border py-2.5 text-center text-sm font-semibold",
                          selected
                            ? "bg-marca/15 border-border-strong text-marca"
                            : "border-border text-text-secondary bg-black/20",
                        )}
                      >
                        {s.startTime}
                      </div>
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
          <div className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
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
        <div className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
          {appointments.length === 0 ? (
            <EmptyState
              icon="🎉"
              title="No hay turnos para hoy"
              description="Todo el día está libre"
            />
          ) : (
            [...appointments]
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .slice(0, 5)
              .map((a) => (
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
              ))
          )}
        </div>
      </div>
    </div>
  );
}
