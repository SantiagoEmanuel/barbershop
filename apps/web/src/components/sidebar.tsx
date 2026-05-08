import { useNavigate } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { NAV_ITEMS } from "./navItems";
import { SideNavItem } from "./sideNavItem";
import { UserAvatar } from "./ui/avatar";
import { Icon } from "./ui/icon";

/**
 * Sidebar fija para desktop del panel admin.
 * Actualmente NO está montada (AdminLayout solo usa MobileDrawer).
 * Queda lista para activarse cuando se priorice el desktop.
 */
export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <aside className="bg-surface border-border sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r lg:flex">
      <div className="border-border flex items-center gap-2.5 border-b px-5 py-5">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="text-marca"
        >
          <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1.8" />
          <circle
            cx="6"
            cy="18"
            r="3"
            stroke="currentColor"
            strokeWidth="1.8"
          />
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
        <div>
          <p className="font-display text-text-primary text-[0.95rem] font-bold">
            THE <span className="text-marca">BARBER</span>
          </p>
          <p className="text-text-muted text-[10px] tracking-widest uppercase">
            Panel Admin
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <SideNavItem key={item.href} item={item} />
        ))}
      </nav>

      <div className="border-border border-t px-3 py-4">
        <div className="bg-marca/5 mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5">
          {user && <UserAvatar name={user.name} size="sm" />}
          <div className="min-w-0 flex-1">
            <p className="text-text-primary truncate text-xs font-semibold">
              {user?.name}
            </p>
            <p className="text-text-muted text-[10px]">Administrador</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="text-text-muted hover:text-error font-body flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150"
        >
          <Icon
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1"
            size={14}
          />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
