/**
 * Helper minimalista para concatenar clases de Tailwind condicionalmente.
 * No deduplica conflictos (para eso harían falta `clsx` + `tailwind-merge`,
 * pero son dependencias extra que no necesitamos hoy).
 *
 * Ejemplo:
 *   <div className={cn("p-4", active && "bg-marca", error ? "text-error" : "text-text-primary")} />
 */
export function cn(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(" ");
}
