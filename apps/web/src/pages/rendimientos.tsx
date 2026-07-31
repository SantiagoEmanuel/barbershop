import {
  EmptyState,
  PickerTabButton,
  SectionHeader,
  Spinner,
  StatCard,
} from "@config/components";
import { useEffect, useState } from "react";
import { BackTo } from "../components/backTo";
import { BarsCard } from "../components/charts";
import { formatARS } from "../components/ui/formatters";
import { api } from "../lib/api";
import type {
  ApiResponse,
  ProductPerformance,
  ServicePerformance,
} from "../types";

type Tab = "products" | "services";

export default function Rendimientos() {
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<ProductPerformance[]>([]);
  const [services, setServices] = useState<ServicePerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<ApiResponse<ProductPerformance[]>>("reports/products"),
      api<ApiResponse<ServicePerformance[]>>("reports/services"),
    ])
      .then(([p, s]) => {
        setProducts(p?.data ?? []);
        setServices(s?.data ?? []);
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

  const totalProfit = products.reduce((s, p) => s + p.profit, 0);
  const totalProductRevenue = products.reduce((s, p) => s + p.revenue, 0);
  const unitsSold = products.reduce((s, p) => s + p.qtySold, 0);
  const mostSoldProduct = [...products].sort(
    (a, b) => b.qtySold - a.qtySold,
  )[0];

  const totalServiceRevenue = services.reduce((s, x) => s + x.revenue, 0);
  const totalTurnos = services.reduce((s, x) => s + x.qty, 0);
  const mostRequested = [...services].sort((a, b) => b.qty - a.qty)[0];

  return (
    <div className="flex flex-col gap-6">
      <BackTo />
      <SectionHeader
        eyebrow="Finanzas · Mes actual"
        title="Rendimientos"
        description="Qué productos y servicios rinden más en el período."
      />

      <div className="border-border flex w-fit gap-1 rounded-xl border bg-black/25 p-1">
        <PickerTabButton
          active={tab === "products"}
          onClick={() => setTab("products")}
          icon="📦"
          label="Productos"
        />
        <PickerTabButton
          active={tab === "services"}
          onClick={() => setTab("services")}
          icon="✂️"
          label="Servicios"
        />
      </div>

      {/* Productos */}
      {tab === "products" &&
        (products.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Sin ventas de productos"
            description="Todavía no hay ventas para calcular rentabilidad."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                label="Ganancia total"
                value={formatARS(totalProfit)}
                icon="💵"
                accent
              />
              <StatCard
                label="Facturación"
                value={formatARS(totalProductRevenue)}
                icon="💰"
              />
              <StatCard label="Unidades vendidas" value={unitsSold} icon="📦" />
              <StatCard
                label="Más vendido"
                value={mostSoldProduct?.name ?? "-"}
                sub={
                  mostSoldProduct ? `${mostSoldProduct.qtySold} u.` : undefined
                }
                icon="🏆"
              />
            </div>

            <div className="bg-surface border-border overflow-x-auto rounded-2xl border p-5">
              <p className="text-text-muted font-body mb-3 text-xs font-semibold tracking-wide uppercase">
                Ranking por rentabilidad
              </p>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-text-muted font-body text-[11px] uppercase">
                    <th className="pb-2 font-semibold">Producto</th>
                    <th className="pb-2 text-right font-semibold">Vend.</th>
                    <th className="pb-2 text-right font-semibold">Facturado</th>
                    <th className="pb-2 text-right font-semibold">Ganancia</th>
                    <th className="pb-2 text-right font-semibold">Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="border-border font-body border-t text-sm"
                    >
                      <td className="text-text-primary py-2 font-semibold">
                        {p.name}
                      </td>
                      <td className="text-text-secondary py-2 text-right tabular-nums">
                        {p.qtySold}
                      </td>
                      <td className="text-text-secondary py-2 text-right tabular-nums">
                        {formatARS(p.revenue)}
                      </td>
                      <td className="text-success py-2 text-right font-semibold tabular-nums">
                        {formatARS(p.profit)}
                      </td>
                      <td className="text-marca py-2 text-right font-semibold tabular-nums">
                        {p.marginPct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ))}

      {/* Servicios */}
      {tab === "services" &&
        (services.length === 0 ? (
          <EmptyState
            icon="✂️"
            title="Sin servicios completados"
            description="Cuando se completen turnos vas a ver el ranking acá."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                label="Facturación servicios"
                value={formatARS(totalServiceRevenue)}
                icon="💰"
                accent
              />
              <StatCard
                label="Turnos completados"
                value={totalTurnos}
                icon="✂️"
              />
              <StatCard
                label="Más pedido"
                value={mostRequested?.name ?? "-"}
                sub={mostRequested ? `${mostRequested.qty} turnos` : undefined}
                icon="🏆"
              />
              <StatCard
                label="Ticket promedio"
                value={formatARS(
                  totalTurnos
                    ? Math.round(totalServiceRevenue / totalTurnos)
                    : 0,
                )}
                icon="🎫"
              />
            </div>

            <BarsCard
              title="Facturación por servicio"
              data={services
                .slice(0, 8)
                .map((s) => ({ label: s.name, value: s.revenue }))}
            />

            <div className="bg-surface border-border overflow-x-auto rounded-2xl border p-5">
              <p className="text-text-muted font-body mb-3 text-xs font-semibold tracking-wide uppercase">
                Ranking de servicios
              </p>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-text-muted font-body text-[11px] uppercase">
                    <th className="pb-2 font-semibold">Servicio</th>
                    <th className="pb-2 text-right font-semibold">Turnos</th>
                    <th className="pb-2 text-right font-semibold">Facturado</th>
                    <th className="pb-2 text-right font-semibold">
                      Ticket prom.
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr
                      key={s.id}
                      className="border-border font-body border-t text-sm"
                    >
                      <td className="text-text-primary py-2 font-semibold">
                        {s.name}
                      </td>
                      <td className="text-text-secondary py-2 text-right tabular-nums">
                        {s.qty}
                      </td>
                      <td className="text-success py-2 text-right font-semibold tabular-nums">
                        {formatARS(s.revenue)}
                      </td>
                      <td className="text-marca py-2 text-right font-semibold tabular-nums">
                        {formatARS(s.averageTicket)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ))}
      <BarsCard
        title="Ganancia por producto"
        data={products
          .slice(0, 8)
          .map((p) => ({ label: p.name, value: p.profit }))}
      />
    </div>
  );
}
