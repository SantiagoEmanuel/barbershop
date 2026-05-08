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
  const accentClasses = accent
    ? "border-marca/30 bg-marca/5"
    : "border-border bg-surface";

  return (
    <div className={`card flex flex-col gap-1 p-4 ${accentClasses} border`}>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-text-muted text-xs font-semibold tracking-wide uppercase">
          {label}
        </p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p
        className={`font-display text-2xl font-bold ${accent ? "text-marca" : "text-text-primary"}`}
      >
        {value}
      </p>
      {sub && <p className="text-text-muted text-xs">{sub}</p>}
    </div>
  );
}
