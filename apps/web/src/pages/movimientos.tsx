import { useEffect, useState } from "react";
import { StatCard } from "../components/statCard";
import { EmptyState } from "../components/ui/emptyState";
import { formatARS } from "../components/ui/formatters";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api } from "../lib/api";

interface Order {
  id: string;
  amount: number;
  status: "pending" | "paid" | "refunded" | "failed";
  createdAt: string;
  paidAt?: string;
  paymentMethod: { name: string; type: string };
  appointment: {
    date: string;
    clientName: string;
    service: { name: string };
    barber: { name: string };
  };
}

type Period = "week" | "month";

function getDatesForPeriod(
  period: Period,
): { from: string; to: string; label: string }[] {
  const today = new Date();
  const result: { from: string; to: string; label: string }[] = [];

  if (period === "week") {
    // Últimos 7 días individualmente
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split("T")[0]!;
      result.push({
        from: iso,
        to: iso,
        label: d.toLocaleDateString("es-AR", {
          weekday: "short",
          day: "numeric",
        }),
      });
    }
  } else {
    // Últimas 4 semanas
    for (let i = 3; i >= 0; i--) {
      const from = new Date(today);
      from.setDate(today.getDate() - (i + 1) * 7 + 1);
      const to = new Date(today);
      to.setDate(today.getDate() - i * 7);
      result.push({
        from: from.toISOString().split("T")[0]!,
        to: to.toISOString().split("T")[0]!,
        label: `S${4 - i}`,
      });
    }
  }
  return result;
}

export default function Movimientos() {
  const [period, setPeriod] = useState<Period>("week");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Pedimos las órdenes de los últimos 30 días para cubrir ambos períodos
    const from = new Date();
    from.setDate(from.getDate() - 30);
    api<{ data: Order[] }>(`order?date=${from.toISOString().split("T")[0]}`)
      .then((r) => setOrders(r?.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const paidOrders = orders.filter((o) => o.status === "paid");

  // ── Agrupar por período ───────────────────────────────────
  const buckets = getDatesForPeriod(period);

  const chartData = buckets.map((bucket) => {
    const inRange = paidOrders.filter((o) => {
      const d = o.appointment?.date ?? o.createdAt.split("T")[0];
      return d >= bucket.from && d <= bucket.to;
    });
    return {
      label: bucket.label,
      total: inRange.reduce((acc, o) => acc + o.amount, 0),
      count: inRange.length,
    };
  });

  const maxTotal = Math.max(...chartData.map((d) => d.total), 1);

  // ── Stats globales ────────────────────────────────────────
  const totalRevenue = paidOrders.reduce((acc, o) => acc + o.amount, 0);
  const totalCount = paidOrders.length;
  const avgTicket = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;

  const refunded = orders
    .filter((o) => o.status === "refunded")
    .reduce((acc, o) => acc + o.amount, 0);

  // ── Por método de pago ────────────────────────────────────
  const byPayment: Record<string, number> = {};
  paidOrders.forEach((o) => {
    const key = o.paymentMethod?.name ?? "Desconocido";
    byPayment[key] = (byPayment[key] ?? 0) + o.amount;
  });

  // ── Por barbero ───────────────────────────────────────────
  const byBarber: Record<string, { count: number; total: number }> = {};
  paidOrders.forEach((o) => {
    const key = o.appointment?.barber?.name ?? "Sin asignar";
    if (!byBarber[key]) byBarber[key] = { count: 0, total: 0 };
    byBarber[key].count++;
    byBarber[key].total += o.amount;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow="Admin"
        title="Movimientos"
        description="Ingresos y actividad de los últimos 30 días."
      />

      {/* Stats globales */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Ingresos totales"
          value={formatARS(totalRevenue)}
          icon="💰"
          accent
        />
        <StatCard label="Órdenes pagadas" value={totalCount} icon="✓" />
        <StatCard
          label="Ticket promedio"
          value={formatARS(avgTicket)}
          icon="🎫"
        />
        <StatCard label="Reembolsado" value={formatARS(refunded)} icon="↩" />
      </div>

      {/* Toggle período */}
      <div className="flex items-center gap-3">
        <p
          className="text-xs font-bold tracking-widest uppercase"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          Vista
        </p>
        <div
          className="flex gap-1 rounded-xl p-1"
          style={{
            background: "rgba(0,0,0,0.25)",
            border: "1px solid var(--color-border)",
          }}
        >
          {(["week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="rounded-lg px-4 py-1.5 text-xs font-bold transition-all duration-200"
              style={{
                fontFamily: "var(--font-body)",
                background: period === p ? "var(--color-marca)" : "transparent",
                color: period === p ? "#272630" : "var(--color-text-muted)",
              }}
            >
              {p === "week" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico de barras */}
      {chartData.every((d) => d.total === 0) ? (
        <EmptyState
          icon="📊"
          title="Sin datos para mostrar"
          description="Aún no hay órdenes pagadas en este período."
        />
      ) : (
        <div
          className="card p-5"
          style={{ background: "var(--color-surface)" }}
        >
          <p
            className="mb-5 text-xs font-bold tracking-widest uppercase"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Ingresos por {period === "week" ? "día" : "semana"}
          </p>

          <div className="flex h-40 items-end gap-2">
            {chartData.map((d) => {
              const pct = maxTotal > 0 ? (d.total / maxTotal) * 100 : 0;
              return (
                <div
                  key={d.label}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  {/* Valor */}
                  {d.total > 0 && (
                    <p
                      className="text-center text-[10px] leading-tight font-bold"
                      style={{
                        color: "var(--color-marca)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {formatARS(d.total).replace("ARS", "").trim()}
                    </p>
                  )}
                  {/* Barra */}
                  <div
                    className="w-full rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${Math.max(pct, 3)}%`,
                      background:
                        d.total > 0
                          ? "linear-gradient(to top, var(--color-marca-deep), var(--color-marca))"
                          : "rgba(248,223,176,0.08)",
                      minHeight: 4,
                    }}
                  />
                  {/* Label */}
                  <p
                    className="text-center text-[10px]"
                    style={{
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {d.label}
                  </p>
                  {d.count > 0 && (
                    <p
                      className="text-center text-[9px]"
                      style={{
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-body)",
                        opacity: 0.6,
                      }}
                    >
                      {d.count} ord.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Por método de pago + por barbero */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Métodos de pago */}
        <div className="card flex flex-col gap-3">
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Por método de pago
          </p>
          {Object.keys(byPayment).length === 0 ? (
            <p
              className="text-sm"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              Sin datos
            </p>
          ) : (
            Object.entries(byPayment)
              .sort(([, a], [, b]) => b - a)
              .map(([name, amount]) => {
                const pct =
                  totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
                return (
                  <div key={name} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: "var(--color-text-secondary)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {name}
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{
                          color: "var(--color-marca)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {formatARS(amount)}
                      </span>
                    </div>
                    <div
                      className="h-1.5 overflow-hidden rounded-full"
                      style={{ background: "rgba(248,223,176,0.1)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: "var(--color-marca)",
                        }}
                      />
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {/* Por barbero */}
        <div className="card flex flex-col gap-3">
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Por barbero
          </p>
          {Object.keys(byBarber).length === 0 ? (
            <p
              className="text-sm"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              Sin datos
            </p>
          ) : (
            Object.entries(byBarber)
              .sort(([, a], [, b]) => b.total - a.total)
              .map(([name, data]) => (
                <div
                  key={name}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: "var(--color-text-primary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {name}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {data.count} turno{data.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: "var(--color-marca)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {formatARS(data.total)}
                  </span>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Listado de órdenes recientes */}
      <div className="flex flex-col gap-3">
        <p
          className="text-xs font-bold tracking-widest uppercase"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          Órdenes recientes
        </p>
        {paidOrders.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Sin órdenes"
            description="No hay órdenes pagadas aún."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {paidOrders.slice(0, 10).map((o) => (
              <div
                key={o.id}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
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
                    {o.appointment?.clientName ?? "—"}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {o.appointment?.service?.name} · {o.appointment?.date} ·{" "}
                    {o.paymentMethod?.name}
                  </p>
                </div>
                <span
                  className="shrink-0 text-sm font-bold"
                  style={{
                    color: "var(--color-marca)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {formatARS(o.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
