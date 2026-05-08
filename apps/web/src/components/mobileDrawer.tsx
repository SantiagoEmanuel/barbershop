import { useNavigate } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { NAV_ITEMS } from "./navItems";
import { SideNavItem } from "./sideNavItem";
import { UserAvatar } from "./ui/avatar";
import { Icon } from "./ui/icon";

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

  // ── Drawer para usuarios NO logueados (top sheet con botón "Iniciar sesión") ──
  if (!user) {
    return (
      <>
        {open && (
          <div
            className="fixed inset-0 z-150 bg-[rgba(20,20,28,0.75)] backdrop-blur-[3px] lg:hidden"
            onClick={onClose}
          />
        )}
        <div
          className={`bg-surface border-border fixed top-0 right-0 left-0 z-160 rounded-b-2xl border py-4 shadow-[0_-16px_40px_rgba(0,0,0,0.4)] transition-transform duration-300 lg:hidden ${
            open ? "translate-y-0" : "-translate-y-[110%]"
          }`}
        >
          <div className="px-4">
            <button
              onClick={() => {
                onOpenAuth?.();
                onClose();
              }}
              className="bg-error/10 border-error/20 text-error font-body mt-4 w-full rounded-xl border py-3 text-sm font-semibold"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Drawer logueado (bottom sheet con menú según rol) ──
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-150 bg-[rgba(20,20,28,0.75)] backdrop-blur-[3px] lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={`bg-surface border-border fixed right-0 bottom-0 left-0 z-160 rounded-t-2xl border shadow-[0_-16px_40px_rgba(0,0,0,0.4)] transition-transform duration-300 lg:hidden ${
          open ? "translate-y-0" : "translate-y-[110%]"
        }`}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="bg-marca/15 h-1 w-10 rounded-full" />
        </div>
        <div className="px-4 pb-8">
          <div className="border-border mb-3 flex items-center gap-3 border-b py-3">
            <UserAvatar name={user.name} size="md" />
            <div>
              <p className="text-text-primary text-sm font-semibold">
                {user.name}
              </p>
              <p className="text-text-muted text-xs">
                {user.role === "client" ? "Cliente" : "Administrador"}
              </p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {user.role === "admin" ? (
              NAV_ITEMS.map((item) => (
                <SideNavItem key={item.href} item={item} onClick={onClose} />
              ))
            ) : (
              <>
                <SideNavItem
                  key="home"
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
                  key="profile"
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
            className="bg-error/10 border-error/20 text-error font-body mt-4 w-full rounded-xl border py-3 text-sm font-semibold"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
