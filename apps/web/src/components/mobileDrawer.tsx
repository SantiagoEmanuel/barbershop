import { useNavigate } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { SideNavItem } from "./sideNavItem";
import { UserAvatar } from "./ui/avatar";
import { Icon } from "./ui/icon";
export type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
};
export const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin",
    label: "Resumen",
    icon: (
      <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />
    ),
    end: true,
  },
  {
    href: "/admin/turnos",
    label: "Turnos del día",
    icon: <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  },
  {
    href: "/admin/reservas",
    label: "Reservas",
    icon: (
      <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    ),
  },
  {
    href: "/admin/ventas",
    label: "Ventas",
    icon: (
      <Icon d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
    ),
  },
  {
    href: "/admin/movimientos",
    label: "Movimientos",
    icon: <Icon d="M18 20V10M12 20V4M6 20v-6" />,
  },
  {
    href: "/admin/servicios",
    label: "Servicios y Productos",
    icon: (
      <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    ),
  },
  {
    href: "/admin/barberos",
    label: "Barberos",
    icon: (
      <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    ),
  },
];
export function MobileDrawer({
  open,
  onClose,
  onOpenAuth,
}: {
  open: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  if (!user) {
    return (
      <>
        {open && (
          <div
            className="fixed inset-0 z-150 lg:hidden"
            style={{
              background: "rgba(20,20,28,0.75)",
              backdropFilter: "blur(3px)",
            }}
            onClick={onClose}
          />
        )}
        <div
          className="fixed top-0 right-0 left-0 z-160 rounded-b-2xl py-4 transition-transform duration-300 lg:hidden"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            transform: open ? "translateY(0)" : "translateY(-110%)",
            boxShadow: "0 -16px 40px rgba(0,0,0,0.4)",
          }}
        >
          <button
            onClick={() => {
              onOpenAuth();
              onClose();
            }}
            className="mt-4 w-full rounded-xl py-3 text-sm font-semibold"
            style={{
              background: "rgba(224,128,128,0.1)",
              border: "1px solid rgba(224,128,128,0.2)",
              fontFamily: "var(--font-body)",
            }}
          >
            Iniciar sesión
          </button>
        </div>
      </>
    );
  }
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-150 lg:hidden"
          style={{
            background: "rgba(20,20,28,0.75)",
            backdropFilter: "blur(3px)",
          }}
          onClick={onClose}
        />
      )}
      <div
        className="fixed right-0 bottom-0 left-0 z-160 rounded-t-2xl transition-transform duration-300 lg:hidden"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          transform: open ? "translateY(0)" : "translateY(110%)",
          boxShadow: "0 -16px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div
            className="h-1 w-10 rounded-full"
            style={{
              background: "rgba(248,223,176,0.15)",
            }}
          />
        </div>
        <div className="px-4 pb-8">
          {user && (
            <div
              className="mb-3 flex items-center gap-3 py-3"
              style={{
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <UserAvatar name={user.name} size="md" />
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  {user.name}
                </p>
                <p
                  className="text-xs"
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                >
                  {user.role === "client" ? "Cliente" : "Administrador"}
                </p>
              </div>
            </div>
          )}
          <nav className="flex flex-col gap-1">
            {user.role === "admin" ? (
              NAV_ITEMS.map((item) => (
                <SideNavItem key={item.href} item={item} onClick={onClose} />
              ))
            ) : (
              <>
                <SideNavItem
                  key={1}
                  item={{
                    href: "/",
                    label: "Inicio",
                    icon: (
                      <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />
                    ),
                    end: true,
                  }}
                  onClick={onClose}
                />
                <SideNavItem
                  key={1}
                  item={{
                    href: "/perfil",
                    label: "Resumen",
                    icon: (
                      <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                    ),
                    end: true,
                  }}
                  onClick={onClose}
                />
              </>
            )}
          </nav>
          <button
            onClick={() => {
              logout();
              navigate("/");
              onClose();
            }}
            className="mt-4 w-full rounded-xl py-3 text-sm font-semibold"
            style={{
              background: "rgba(224,128,128,0.1)",
              border: "1px solid rgba(224,128,128,0.2)",
              color: "var(--color-error)",
              fontFamily: "var(--font-body)",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
