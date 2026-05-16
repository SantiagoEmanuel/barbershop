import { cn } from "../../lib/cn";

export function Row({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          "font-body text-sm",
          emphasis ? "text-text-primary font-semibold" : "text-text-muted",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-body text-sm",
          emphasis ? "text-marca font-bold" : "text-text-primary",
        )}
      >
        {value}
      </span>
    </div>
  );
}
