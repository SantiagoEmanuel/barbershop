import { Link } from "react-router";

export function BackTo({
  to = "/admin",
  label = "Resumen",
}: {
  to?: string;
  label?: string;
}) {
  return (
    <Link
      to={to}
      className="text-text-muted hover:text-marca font-body group inline-flex w-fit items-center gap-1.5 text-sm no-underline transition-colors"
    >
      <span className="transition-transform group-hover:-translate-x-0.5">
        ←
      </span>
      {label}
    </Link>
  );
}
