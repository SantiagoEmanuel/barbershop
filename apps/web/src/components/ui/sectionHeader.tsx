import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex w-full flex-col items-center justify-between gap-4">
      <div className="flex w-full flex-col justify-center gap-2">
        {eyebrow && <span className="badge-marca m-auto">{eyebrow}</span>}
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            color: "var(--color-text-primary)",
            fontWeight: 700,
          }}
          className="text-center"
        >
          {title}
        </h2>
        {description && (
          <p
            className="text-center text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
