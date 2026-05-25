import type { ReactNode } from "react";

/**
 * Vista de "no hay nada acá" — pensada para lugares donde un grid o lista
 * está vacío. El círculo con borde de marca ayuda a que se sienta intencional
 * y no como una pantalla en blanco.
 */
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
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center sm:py-16">
      {icon && (
        <div
          aria-hidden
          className="bg-marca/8 border-marca/15 text-marca flex size-16 items-center justify-center rounded-full border text-3xl"
        >
          {icon}
        </div>
      )}
      <div className="flex max-w-sm flex-col gap-1.5">
        <p className="text-text-primary font-display text-base font-bold sm:text-lg">
          {title}
        </p>
        {description && (
          <p className="text-text-muted font-body text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
