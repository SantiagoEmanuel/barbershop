/**
 * Logo de tijera + nombre de la marca.
 * Se reutiliza en navbar, sidebar y footer; antes el SVG se duplicaba
 * 3 veces idéntico.
 */
export function BrandLogo({
  size = 22,
  text = "PEKO BARBER",
  textVariant = "marca",
}: {
  size?: number;
  text?: string;
  textVariant?: "marca" | "primary";
}) {
  const textClass =
    textVariant === "marca" ? "text-marca" : "text-text-primary";

  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="text-marca shrink-0"
      >
        <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M8.6 7.4L21 3M8.6 16.6L21 21"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M21 3L9 12M21 21L9 12"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`font-display text-[1.1rem] font-bold tracking-[0.04em] ${textClass}`}
      >
        {text}
      </span>
    </div>
  );
}
