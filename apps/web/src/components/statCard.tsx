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
      className="card flex flex-col gap-1 p-4"
      style={
        accent
          ? {
              borderColor: "rgba(248,223,176,0.3)",
              background: "rgba(248,223,176,0.05)",
            }
          : {}
      }
    >
      <div className="mb-1 flex items-center justify-between">
        <p
          className="text-xs font-semibold tracking-wide uppercase"
          style={{
            color: "var(--color-text-muted)",
          }}
        >
          {label}
        </p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p
        className="text-2xl font-bold"
        style={{
          color: accent ? "var(--color-marca)" : "var(--color-text-primary)",
          fontFamily: "var(--font-display)",
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-xs"
          style={{
            color: "var(--color-text-muted)",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
