import { useNavigate } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { SideNavItem } from "./sideNavItem";
import { UserAvatar } from "./ui/avatar";
import { Icon } from "./ui/icon";
export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  return (
    <aside
      className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto lg:flex"
      style={{
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
      }}
    >
      {}
      <div
        className="flex items-center gap-2.5 px-5 py-5"
        style={{
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            color: "var(--color-marca)",
          }}
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
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "var(--color-text-primary)",
            }}
          >
            THE{" "}
            <span
              style={{
                color: "var(--color-marca)",
              }}
            >
              BARBER
            </span>
          </p>
          <p
            className="text-[10px] tracking-widest uppercase"
            style={{
              color: "var(--color-text-muted)",
            }}
          >
            Panel Admin
          </p>
        </div>
      </div>

      {}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <SideNavItem key={item.href} item={item} />
        ))}
      </nav>

      {}
      <div
        className="px-3 py-4"
        style={{
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <div
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5"
          style={{
            background: "rgba(248,223,176,0.05)",
          }}
        >
          {user && <UserAvatar name={user.name} size="sm" />}
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-xs font-semibold"
              style={{
                color: "var(--color-text-primary)",
              }}
            >
              {user?.name}
            </p>
            <p
              className="text-[10px]"
              style={{
                color: "var(--color-text-muted)",
              }}
            >
              Administrador
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--color-error)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--color-text-muted)";
          }}
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
