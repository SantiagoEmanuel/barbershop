import {
  EmptyState,
  SectionHeader,
  Spinner,
  StatCard,
} from "@config/components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BackTo } from "../components/backTo";
import { BarsCard, DonutCard } from "../components/charts";
import { formatARS } from "../components/ui/formatters";
import { api } from "../lib/api";
import type { ApiResponse, IncomeReport, ReportSummary } from "../types";

/** 'YYYY-MM-DD' → 'DD/MM' para etiquetas de gráfico. */
function shortDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export default function Ingresos() {
  const navigate = useNavigate();
  const [income, setIncome] = useState<IncomeReport | null>(null);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<ApiResponse<IncomeReport>>("reports/income"),
      api<ApiResponse<ReportSummary>>("reports/summary"),
    ])
      .then(([i, s]) => {
        setIncome(i?.data ?? null);
        setSummary(s?.data ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  const byDay = (income?.byDay ?? []).map((d) => ({
    label: shortDate(d.date),
    value: d.amount,
  }));

  const splitData = summary
    ? [
        { name: "Servicios", value: summary.incomeBreakdown.services },
        { name: "Productos", value: summary.incomeBreakdown.products },
      ].filter((d) => d.value > 0)
    : [];

  const byMethod = (summary?.incomeBreakdown.byMethod ?? []).map((m) => ({
    name: m.name,
    value: m.amount,
  }));

  return (
    <div className="flex flex-col gap-6">
      <BackTo />
      <SectionHeader
        eyebrow="Finanzas · Mes actual"
        title="Ingresos"
        description="Detalle de la facturación cobrada en el período."
        action={
          <button
            onClick={() => navigate("/admin")}
            className="btn-ghost rounded-xl px-4 py-2 text-sm"
          >
            ← Volver al panel
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total ingresos"
          value={formatARS(income?.total ?? 0)}
          sub={`${income?.count ?? 0} órdenes pagas`}
          icon="💰"
          accent
        />
        <StatCard
          label="En servicios"
          value={formatARS(summary?.incomeBreakdown.services ?? 0)}
          icon="✂️"
        />
        <StatCard
          label="En productos"
          value={formatARS(summary?.incomeBreakdown.products ?? 0)}
          icon="🧴"
        />
        <StatCard
          label="Ticket promedio"
          value={formatARS(income?.averageTicket ?? 0)}
          icon="🎫"
        />
      </div>

      {(income?.orders.length ?? 0) === 0 ? (
        <EmptyState
          icon="📊"
          title="Sin ingresos"
          description="Todavía no hay órdenes pagas en este período."
        />
      ) : (
        <>
          <BarsCard title="Ingresos por día" data={byDay} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {splitData.length > 0 && (
              <DonutCard title="Servicios vs productos" data={splitData} />
            )}
            {byMethod.length > 0 && (
              <DonutCard title="Por método de pago" data={byMethod} />
            )}
          </div>

          <div className="bg-surface border-border rounded-2xl border p-5">
            <p className="text-text-muted font-body mb-3 text-xs font-semibold tracking-wide uppercase">
              Órdenes pagas
            </p>
            <div className="flex flex-col gap-2">
              {income!.orders.map((o) => (
                <div
                  key={o.id}
                  className="border-border flex items-center gap-3 border-b py-2 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-text-primary font-body truncate text-sm font-semibold">
                      {o.service ?? "Venta de mostrador"}
                      {o.productsCount > 0 && (
                        <span className="text-text-muted font-normal">
                          {" "}
                          · {o.productsCount} prod.
                        </span>
                      )}
                    </p>
                    <p className="text-text-muted font-body text-xs">
                      {o.barber ?? "—"} · {o.paymentMethod ?? "—"} ·{" "}
                      {new Date(o.paidAt).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <span className="text-success font-body shrink-0 text-sm font-bold">
                    {formatARS(o.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
