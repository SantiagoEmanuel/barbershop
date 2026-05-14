import { useEffect, useState } from "react";
import { StatCard } from "../components/statCard";
import { EmptyState } from "../components/ui/emptyState";
import { formatARS } from "../components/ui/formatters";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api } from "../lib/api";
import type { ApiResponse, Order } from "../types";

type Period = "week" | "month";

interface Bucket {
  from: string;
  to: string;
  label: string;
}

function getDatesForPeriod(period: Period): Bucket[] {
  const today = new Date();
  const result: Bucket[] = [];

  if (period === "week") {
    // Últimos 7 días individuales
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
    const from = new Date();
    from.setDate(from.getDate() - 30);
    api<ApiResponse<Order[]>>(`order?date=${from.toISOString().split("T")[0]}`)
      .then((r) => setOrders(r?.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const paidOrders = orders.filter((o) => o.status === "paid");

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

  const totalRevenue = paidOrders.reduce((acc, o) => acc + o.amount, 0);
  const totalCount = paidOrders.length;
  const avgTicket = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;
  const refunded = orders
    .filter((o) => o.status === "refunded")
    .reduce((acc, o) => acc + o.amount, 0);

  const byPayment: Record<string, number> = {};
  paidOrders.forEach((o) => {
    const key = o.paymentMethod?.name ?? "Desconocido";
    byPayment[key] = (byPayment[key] ?? 0) + o.amount;
  });

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
        <p className="text-text-muted font-body text-xs font-bold tracking-widest uppercase">
          Vista
        </p>
        <div className="border-border flex gap-1 rounded-xl border bg-black/25 p-1">
          {(["week", "month"] as Period[]).map((p) => {
            const active = period === p;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`font-body rounded-lg px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                  active
                    ? "bg-marca text-background"
                    : "text-text-muted bg-transparent"
                }`}
              >
                {p === "week" ? "Semana" : "Mes"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      {chartData.every((d) => d.total === 0) ? (
        <EmptyState
          icon="📊"
          title="Sin datos para mostrar"
          description="Aún no hay órdenes pagadas en este período."
        />
      ) : (
        <div className="card bg-surface p-5">
          <p className="text-text-muted font-body mb-5 text-xs font-bold tracking-widest uppercase">
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
                  {d.total > 0 && (
                    <p className="text-marca font-body text-center text-[10px] leading-tight font-bold">
                      {formatARS(d.total).replace("ARS", "").trim()}
                    </p>
                  )}
                  <div
                    className={`min-h-1 w-full rounded-t-lg transition-all duration-500 ${
                      d.total > 0
                        ? "from-marca-deep to-marca bg-linear-to-t"
                        : "bg-marca/8"
                    }`}
                    style={{ height: `${Math.max(pct, 3)}%` }}
                  />
                  <p className="text-text-muted font-body text-center text-[10px]">
                    {d.label}
                  </p>
                  {d.count > 0 && (
                    <p className="text-text-muted/60 font-body text-center text-[9px]">
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
        <div className="card flex flex-col gap-3">
          <p className="text-text-muted font-body text-xs font-bold tracking-widest uppercase">
            Por método de pago
          </p>
          {Object.keys(byPayment).length === 0 ? (
            <p className="text-text-muted font-body text-sm">Sin datos</p>
          ) : (
            Object.entries(byPayment)
              .sort(([, a], [, b]) => b - a)
              .map(([name, amount]) => {
                const pct =
                  totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
                return (
                  <div key={name} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary font-body text-sm font-medium">
                        {name}
                      </span>
                      <span className="text-marca font-body text-sm font-bold">
                        {formatARS(amount)}
                      </span>
                    </div>
                    <div className="bg-marca/10 h-1.5 overflow-hidden rounded-full">
                      <div
                        className="bg-marca h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
          )}
        </div>

        <div className="card flex flex-col gap-3">
          <p className="text-text-muted font-body text-xs font-bold tracking-widest uppercase">
            Por barbero
          </p>
          {Object.keys(byBarber).length === 0 ? (
            <p className="text-text-muted font-body text-sm">Sin datos</p>
          ) : (
            Object.entries(byBarber)
              .sort(([, a], [, b]) => b.total - a.total)
              .map(([name, data]) => (
                <div
                  key={name}
                  className="border-border flex items-center justify-between gap-3 rounded-xl border bg-black/20 px-3 py-2.5"
                >
                  <div>
                    <p className="text-text-primary font-body text-sm font-semibold">
                      {name}
                    </p>
                    <p className="text-text-muted font-body text-xs">
                      {data.count} turno{data.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="text-marca font-body text-sm font-bold">
                    {formatARS(data.total)}
                  </span>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Listado de órdenes */}
      <div className="flex flex-col gap-3">
        <p className="text-text-muted font-body text-xs font-bold tracking-widest uppercase">
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
                className="bg-surface border-border flex items-center gap-3 rounded-xl border px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary font-body text-sm font-semibold">
                    {o.appointment?.clientName ?? "—"}
                  </p>
                  <p className="text-text-muted font-body text-xs">
                    {o.appointment?.service?.name} · {o.appointment?.date} ·{" "}
                    {o.paymentMethod?.name}
                  </p>
                </div>
                <span className="text-marca font-body shrink-0 text-sm font-bold">
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
