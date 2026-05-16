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
    api<ApiResponse<Order[]>>("order/all")
      .then((r) => setOrders(r?.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const paidOrders = orders.filter((o) => o.status === "paid");

  const buckets = getDatesForPeriod(period);

  const chartData = buckets.map((bucket) => {
    const inRange = paidOrders.filter((o) => {
      const d = o.appointment?.date ?? o.createdAt?.split("T")[0];
      if (!d) return false;
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
        description="Ingresos y facturación del negocio."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total facturado"
          value={formatARS(totalRevenue)}
          icon="💰"
          accent
        />
        <StatCard label="Órdenes pagas" value={totalCount} icon="✅" />
        <StatCard
          label="Ticket promedio"
          value={formatARS(avgTicket)}
          icon="🎫"
        />
        <StatCard label="Reembolsado" value={formatARS(refunded)} icon="↩️" />
      </div>

      <div className="border-border flex gap-1 self-start rounded-xl border bg-black/25 p-1">
        {(["week", "month"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`font-body rounded-lg px-4 py-1.5 text-sm transition-colors ${
              period === p
                ? "bg-marca text-background font-semibold"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {p === "week" ? "Últimos 7 días" : "Últimas 4 semanas"}
          </button>
        ))}
      </div>

      {paidOrders.length === 0 ? (
        <EmptyState
          icon="📊"
          title="Sin movimientos"
          description="Todavía no hay órdenes pagas registradas."
        />
      ) : (
        <div className="bg-surface border-border rounded-2xl border p-5">
          <p className="text-text-muted font-body mb-4 text-xs font-semibold tracking-wide uppercase">
            Ingresos
          </p>
          <div className="flex items-end gap-2" style={{ height: 160 }}>
            {chartData.map((d) => (
              <div
                key={d.label}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <span className="text-text-muted font-body text-[10px]">
                  {d.total > 0 ? formatARS(d.total) : ""}
                </span>
                <div
                  className="bg-marca w-full rounded-t-md transition-all"
                  style={{
                    height: `${Math.max((d.total / maxTotal) * 120, d.total > 0 ? 4 : 0)}px`,
                  }}
                />
                <span className="text-text-muted font-body text-[10px]">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(byPayment).length > 0 && (
        <div className="bg-surface border-border rounded-2xl border p-5">
          <p className="text-text-muted font-body mb-3 text-xs font-semibold tracking-wide uppercase">
            Por método de pago
          </p>
          <ul className="flex flex-col gap-2">
            {Object.entries(byPayment).map(([method, amount]) => (
              <li key={method} className="flex items-center justify-between">
                <span className="text-text-primary font-body text-sm">
                  {method}
                </span>
                <span className="text-marca font-body text-sm font-semibold">
                  {formatARS(amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
