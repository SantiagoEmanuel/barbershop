import { ChevronDown, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "../lib/cn";
import { useAuthStore } from "../store/useAuthStore";
import { useBookingStore } from "../store/useBookingStore";
import { AdminNavDropdown } from "./adminNavDropdown";
import { MobileDrawer } from "./mobileDrawer";
import { UserAvatar } from "./ui/avatar";
import { BrandLogo } from "./ui/logo";
import { UserMenu } from "./userMenu";

/**
 * Navbar unificado para todo el sitio.
 *
 * Detecta el contexto por la ruta:
 *  - `/admin/*` → muestra los items del panel admin (NAV_ITEMS).
 *  - Cualquier otra → muestra los anchors del sitio público.
 *
 * El área del usuario tiene 3 estados:
 *  - sin user        → botones "Ingresar" / "Sacar turno".
 *  - cliente         → avatar + dropdown con Mi perfil, Mis turnos.
 *  - admin           → avatar + dropdown con shortcut al panel (o al sitio).
 *
 * En mobile la navegación principal se delega al `MobileDrawer` (botón hamburguesa).
 */

const PUBLIC_LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#barberos", label: "Barberos" },
  { href: "#nosotros", label: "Nosotros" },
];

export function Navbar({
  onOpenAuth,
}: {
  onOpenAuth: (tab?: "login" | "register") => void;
}) {
  const openBooking = useBookingStore((s) => s.openModal);

  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const inAdminArea = location.pathname.startsWith("/admin");

  // Sombra/borde al hacer scroll — feedback sutil de que la navbar es sticky.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cerrar dropdown al cambiar de ruta.
  useEffect(() => {
    setUserMenuOpen(false);
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-100 border-b backdrop-blur-md transition-all duration-300",
          scrolled
            ? "bg-background/95 border-marca/10"
            : "bg-background/60 border-transparent",
        )}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-3 sm:h-16">
            {/* Logo + indicador de "panel" si está en /admin */}
            <Link
              to={inAdminArea ? "/admin" : "/"}
              className="flex shrink-0 items-center gap-2 no-underline"
            >
              <BrandLogo />
              {inAdminArea && (
                <span className="bg-marca/12 text-marca border-marca/20 hidden rounded-md border px-1.5 py-0.5 text-[10px] font-bold tracking-widest uppercase sm:inline-block">
                  Panel
                </span>
              )}
            </Link>

            {/* Links centrales (desktop) */}
            <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
              {inAdminArea ? (
                <AdminNavDropdown />
              ) : (
                PUBLIC_LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="text-text-secondary/75 hover:text-marca font-body text-sm font-medium tracking-wide no-underline transition-colors duration-200"
                  >
                    {l.label}
                  </a>
                ))
              )}
            </nav>

            {/* User area */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {/* Desktop */}
              <div className="hidden items-center gap-2.5 md:flex">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen((v) => !v)}
                      aria-haspopup="menu"
                      aria-expanded={userMenuOpen}
                      className={cn(
                        "border-marca/12 hover:bg-marca/8 flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-all duration-200",
                        userMenuOpen ? "bg-marca/10" : "bg-transparent",
                      )}
                    >
                      <UserAvatar name={user.name} size="sm" />
                      <span className="text-text-primary font-body max-w-32 truncate text-sm font-semibold capitalize">
                        {user.name.split(" ")[0]}
                      </span>
                      <ChevronDown
                        size={14}
                        className={cn(
                          "text-text-muted/60 transition-transform duration-200",
                          userMenuOpen && "rotate-180",
                        )}
                      />
                    </button>

                    {userMenuOpen && (
                      <UserMenu
                        user={user}
                        onClose={() => setUserMenuOpen(false)}
                      />
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onOpenAuth("login")}
                      className="border-marca/15 text-text-secondary/85 hover:border-marca/35 hover:text-marca font-body rounded-lg border bg-transparent px-4 py-1.5 text-sm font-semibold transition-all duration-200"
                    >
                      Ingresar
                    </button>
                    <button
                      onClick={() => openBooking()}
                      className="bg-marca hover:bg-marca-deep text-background font-body rounded-lg px-4 py-1.5 text-sm font-bold transition-all duration-200 active:scale-[0.97]"
                    >
                      Sacar turno
                    </button>
                  </>
                )}
              </div>

              {/* Mobile */}
              <div className="flex items-center gap-2 md:hidden">
                {user && (
                  <Link to="/perfil" className="flex items-center">
                    <UserAvatar name={user.name} size="sm" />
                  </Link>
                )}
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="text-text-secondary/75 hover:text-marca bg-marca/6 rounded-lg p-2 transition-colors duration-150"
                  aria-label="Abrir menú"
                >
                  <Menu size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenAuth={onOpenAuth}
        openBooking={openBooking}
      />
    </>
  );
}
