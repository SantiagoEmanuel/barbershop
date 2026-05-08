import { NavLink } from "react-router";
import type { NavItem } from "./mobileDrawer";
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
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${isActive ? "nav-item-active" : "nav-item"}`
      }
      style={({ isActive }) => ({
        fontFamily: "var(--font-body)",
        background: isActive ? "rgba(248,223,176,0.12)" : "transparent",
        color: isActive ? "var(--color-marca)" : "var(--color-text-muted)",
        border: isActive
          ? "1px solid rgba(248,223,176,0.2)"
          : "1px solid transparent",
      })}
    >
      <span className="shrink-0 opacity-80">{item.icon}</span>
      {item.label}
    </NavLink>
  );
}
