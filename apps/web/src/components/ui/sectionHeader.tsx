import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/**
 * Encabezado de sección. Layout:
 *   - mobile (default): apila eyebrow → title → description → action, alineado a izquierda
 *   - sm+: eyebrow + title + description a la izquierda, action a la derecha
 *
 * El `align="center"` mantiene la variante centrada para usos especiales
 * (hero del home, pantallas de éxito), pero la default es alineada a izquierda
 * porque es la que mejor escala en páginas con contenido denso (admin).
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "start",
  divider = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "start" | "center";
  divider?: boolean;
}) {
  const isCenter = align === "center";

  return (
    <header
      className={cn(
        "flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        divider && "border-border border-b pb-5",
        isCenter && "items-center text-center sm:flex-col sm:items-center",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-col gap-1.5",
          isCenter && "items-center",
        )}
      >
        {eyebrow && (
          <div
            className={cn(
              "flex items-center gap-2",
              isCenter && "justify-center",
            )}
          >
            <span
              aria-hidden
              className="bg-marca block h-px w-6 rounded-full opacity-70"
            />
            <span className="text-marca font-body text-[11px] font-bold tracking-[0.18em] uppercase">
              {eyebrow}
            </span>
          </div>
        )}
        <h2 className="font-display text-text-primary text-2xl leading-tight font-bold sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "text-text-muted font-body text-sm leading-relaxed",
              isCenter ? "max-w-md" : "max-w-2xl",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <div
          className={cn(
            "flex shrink-0 items-center gap-2",
            isCenter && "justify-center",
          )}
        >
          {action}
        </div>
      )}
    </header>
  );
}
