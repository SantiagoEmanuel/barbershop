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
        <h2 className="font-display text-text-primary text-center text-2xl font-bold">
          {title}
        </h2>
        {description && (
          <p className="text-text-muted text-center text-sm">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
