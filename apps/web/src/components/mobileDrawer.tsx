import { LogIn, LogOut, Scissors, Settings, UserPlus } from "lucide-react";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { cn } from "../lib/cn";
import { useAuthStore } from "../store/useAuthStore";
import { NAV_ITEMS } from "./navItems";
import { SideNavItem } from "./sideNavItem";
import { UserAvatar } from "./ui/avatar";
import { Icon } from "./ui/icon";

/**
 * Drawer móvil del navbar. Tres modos:
 *  1. Sin user           → CTAs Ingresar / Sacar turno (top sheet).
 *  2. Cliente            → links "Inicio" y "Mi perfil" + logout (bottom sheet).
 *  3. Admin              → NAV_ITEMS del panel + shortcut a sitio público / a panel
 *                          según dónde esté navegando (bottom sheet).
 */
export function MobileDrawer({
  open,
  onClose,
  onOpenAuth,
  openBooking,
}: {
  open: boolean;
  onClose: () => void;
  onOpenAuth?: (tab?: "login" | "register") => void;
  openBooking: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const inAdminArea = location.pathname.startsWith("/admin");

  // Cerrar al cambiar de ruta. Mantenemos `onClose` en un ref que se actualiza
  // dentro del effect (para evitar la dependencia) y solo reaccionamos al
  // cambio de pathname.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    closeRef.current();
  }, [location.pathname]);

  // ── Sin user: top sheet con CTAs ─────────────────────────
  if (!user) {
    return (
      <>
        <Overlay open={open} onClose={onClose} />
        <Sheet open={open} position="top">
          <div className="flex flex-col gap-3 px-4 pt-2 pb-5">
            <p className="text-text-muted font-body text-center text-xs">
              Para sacar turno o ver tus reservas
            </p>
            <button
              onClick={() => {
                onOpenAuth?.("login");
                onClose();
              }}
              className="bg-marca/8 border-marca/25 text-marca font-body flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold"
            >
              <LogIn size={16} /> Ingresar
            </button>
            <button
              onClick={() => {
                openBooking();
                onClose();
              }}
              className="bg-marca text-background font-body flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold active:scale-[0.98]"
            >
              <UserPlus size={16} /> Sacar turno
            </button>
          </div>
        </Sheet>
      </>
    );
  }

  // ── Con user: bottom sheet con navegación según rol ──────
  const isAdmin = user.role === "admin";

  return (
    <>
      <Overlay open={open} onClose={onClose} />
      <Sheet open={open} position="bottom">
        {/* Handle visual */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="bg-marca/15 h-1 w-10 rounded-full" />
        </div>

        <div className="px-4 pb-6">
          {/* Identidad */}
          <div className="border-border mb-3 flex items-center gap-3 border-b py-3">
            <UserAvatar name={user.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-text-primary font-body truncate text-sm font-semibold capitalize">
                {user.name}
              </p>
              <div className="flex items-center gap-1.5">
                {isAdmin && (
                  <span className="bg-marca/15 text-marca rounded px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase">
                    Admin
                  </span>
                )}
                <p className="text-text-muted font-body truncate text-xs">
                  @{user.username}
                </p>
              </div>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex flex-col gap-1">
            {isAdmin && inAdminArea ? (
              <>
                {NAV_ITEMS.map((item) => (
                  <SideNavItem key={item.href} item={item} onClick={onClose} />
                ))}
                <SideNavItem
                  key="public-site"
                  item={{
                    href: "/",
                    label: "Ir al sitio público",
                    icon: <Scissors size={16} />,
                    end: true,
                  }}
                  onClick={onClose}
                />
              </>
            ) : isAdmin && !inAdminArea ? (
              <>
                <SideNavItem
                  key="admin-panel"
                  item={{
                    href: "/admin",
                    label: "Panel admin",
                    icon: <Settings size={16} />,
                    end: true,
                  }}
                  onClick={onClose}
                />
                <ClientLinks onClose={onClose} />
              </>
            ) : (
              <ClientLinks onClose={onClose} />
            )}
          </nav>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              navigate("/");
              onClose();
            }}
            className="bg-error/10 border-error/20 text-error hover:bg-error/15 font-body mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </Sheet>
    </>
  );
}

// ── Subcomponentes internos ───────────────────────────────────

function Overlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-150 bg-[rgba(20,20,28,0.75)] backdrop-blur-[3px] lg:hidden"
      onClick={onClose}
    />
  );
}

function Sheet({
  open,
  position,
  children,
}: {
  open: boolean;
  position: "top" | "bottom";
  children: React.ReactNode;
}) {
  const base =
    "bg-surface border-border fixed right-0 left-0 z-160 border shadow-[0_-16px_40px_rgba(0,0,0,0.4)] transition-transform duration-300 lg:hidden";
  const pos =
    position === "top"
      ? cn(
          "top-0 rounded-b-2xl pt-2",
          open ? "translate-y-0" : "-translate-y-[110%]",
        )
      : cn(
          "bottom-0 rounded-t-2xl",
          open ? "translate-y-0" : "translate-y-[110%]",
        );
  return <div className={cn(base, pos)}>{children}</div>;
}

function ClientLinks({ onClose }: { onClose: () => void }) {
  return (
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
          label: "Mi perfil",
          icon: (
            <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
          ),
          end: true,
        }}
        onClick={onClose}
      />
      <SideNavItem
        key="mis-turnos"
        item={{
          href: "/mis-turnos",
          label: "Mis turnos",
          icon: (
            <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          ),
          end: true,
        }}
        onClick={onClose}
      />
    </>
  );
}
