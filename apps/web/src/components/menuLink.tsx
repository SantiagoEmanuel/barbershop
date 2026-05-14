import type { ReactNode } from "react";

/**
 * Link de menú con icono + label. Usado en UserMenu (dropdown desde navbar).
 * El icono se pinta a `currentColor`, así sigue el cambio de color del hover.
 */
export function MenuLink({
  href,
  icon,
  label,
  onClose,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  onClose: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClose}
      className="text-text-secondary hover:bg-marca/8 hover:text-marca font-body flex items-center gap-3 px-4 py-2.5 text-sm font-medium no-underline transition-colors duration-150"
    >
      <span aria-hidden className="shrink-0 opacity-80">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </a>
  );
}
