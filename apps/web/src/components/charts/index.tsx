import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatARS } from "../ui/formatters";

/** Paleta alineada a los tokens de diseño (marca primero). */
const CHART_COLORS = [
  "#f8dfb0", // marca
  "#86c586", // success
  "#e6b96a", // warning
  "#9b8cce",
  "#6ab0d4",
  "#e08080", // error
  "#d4a853", // marca-deep
  "#c98ca0",
];

const MUTED = "#8b8899";

function MoneyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name?: string }[];
  label?: string | number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-surface-2 border-border rounded-lg border px-3 py-2 shadow-lg">
      {label !== undefined && (
        <p className="text-text-muted font-body mb-0.5 text-[11px]">{label}</p>
      )}
      <p className="text-text-primary font-body text-sm font-semibold">
        {formatARS(payload[0]!.value)}
      </p>
    </div>
  );
}

/** Card con un gráfico de barras verticales de montos en centavos. */
export function BarsCard({
  title,
  data,
  color = CHART_COLORS[0],
  height = 220,
}: {
  title?: string;
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  return (
    <div className="bg-surface border-border rounded-2xl border p-5">
      {title && (
        <p className="text-text-muted font-body mb-4 text-xs font-semibold tracking-wide uppercase">
          {title}
        </p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: MUTED, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "rgba(248,223,176,0.08)" }}
            content={<MoneyTooltip />}
          />
          <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Card con un donut + leyenda lateral para desgloses por categoría/método. */
export function DonutCard({
  title,
  data,
  height = 220,
}: {
  title?: string;
  data: { name: string; value: number }[];
  height?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="bg-surface border-border rounded-2xl border p-5">
      {title && (
        <p className="text-text-muted font-body mb-4 text-xs font-semibold tracking-wide uppercase">
          {title}
        </p>
      )}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="w-full sm:w-1/2" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="58%"
                outerRadius="85%"
                paddingAngle={2}
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<MoneyTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex w-full flex-col gap-2 sm:w-1/2">
          {data.map((d, i) => (
            <li key={d.name} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <span className="text-text-secondary font-body flex-1 truncate text-sm">
                {d.name}
              </span>
              <span className="text-text-primary font-body text-sm font-semibold">
                {formatARS(d.value)}
              </span>
              <span className="text-text-muted font-body w-10 text-right text-xs">
                {total ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
