/**
 * Helper minimalista para concatenar clases de Tailwind condicionalmente.
 * No deduplica conflictos (para eso harían falta `clsx` + `tailwind-merge`).
 */
export function cn(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(" ");
}
