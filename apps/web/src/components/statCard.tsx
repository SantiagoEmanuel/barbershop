import { cn } from "../lib/cn";

/**
 * KPI compacto para grids de stats (Dashboard, Movimientos, Ventas).
 * El `accent` resalta la métrica clave del grupo (típicamente facturación).
 */
export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-1.5 overflow-hidden rounded-2xl border p-4 transition-colors duration-200 sm:p-5",
        accent
          ? "border-marca/35 bg-marca/8 hover:bg-marca/12"
          : "border-border bg-surface hover:border-border-strong",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-text-muted font-body truncate text-[10px] font-bold tracking-[0.12em] uppercase sm:text-xs">
          {label}
        </p>
        {icon && (
          <span aria-hidden className="text-base opacity-70 sm:text-lg">
            {icon}
          </span>
        )}
      </div>
      <p
        className={cn(
          "font-display truncate text-2xl leading-none font-bold tabular-nums sm:text-3xl",
          accent ? "text-marca" : "text-text-primary",
        )}
      >
        {value}
      </p>
      {sub && (
        <p className="text-text-muted font-body truncate text-xs">{sub}</p>
      )}
    </div>
  );
}
