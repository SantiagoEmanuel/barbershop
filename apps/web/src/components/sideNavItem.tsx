import { NavLink } from "react-router";
import type { NavItem } from "../types";

/**
 * Item de navegación para sidebar y drawer móvil.
 * El estilo activo se aplica con clases puras de Tailwind via className
 * functional de NavLink, sin style inline.
 */
export function SideNavItem({
  item,
  onClick,
}: {
  item: NavItem;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={item.href}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        `font-body flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
          isActive
            ? "bg-marca/12 text-marca border-marca/20"
            : "text-text-muted border-transparent"
        }`
      }
    >
      <span className="shrink-0 opacity-80">{item.icon}</span>
      {item.label}
    </NavLink>
  );
}
