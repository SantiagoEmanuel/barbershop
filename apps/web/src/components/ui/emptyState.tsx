import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {icon && <span className="mb-1 text-4xl">{icon}</span>}
      <p
        className="font-semibold"
        style={{
          color: "var(--color-text-secondary)",
          fontFamily: "var(--font-body)",
        }}
      >
        {title}
      </p>
      {description && (
        <p
          className="max-w-xs text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
