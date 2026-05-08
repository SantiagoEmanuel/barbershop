import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MobileDrawer } from "./mobileDrawer";
import { UserAvatar } from "./ui/avatar";
import { BrandLogo } from "./ui/logo";
import { UserMenu } from "./userMenu";

export function Navbar({
  onOpenAuth,
}: {
  onOpenAuth: (tab?: "login" | "register") => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 z-100 border-b backdrop-blur-md transition-all duration-300 ${
          scrolled
            ? "bg-background/95 border-marca/10"
            : "bg-background/60 border-transparent"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between sm:h-16">
            <a href="/" className="flex shrink-0 items-center no-underline">
              <BrandLogo />
            </a>

            {/* Links centrales (desktop) */}
            <nav className="hidden items-center gap-7 md:flex">
              {[
                { href: "#servicios", label: "Servicios" },
                { href: "#barberos", label: "Barberos" },
                { href: "#nosotros", label: "Nosotros" },
              ].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-text-secondary/75 hover:text-marca font-body text-sm font-medium tracking-wide no-underline transition-colors duration-200"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            {/* CTAs / user */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2.5 md:flex">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen((v) => !v)}
                      className={`border-marca/12 hover:bg-marca/8 flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-all duration-200 ${
                        userMenuOpen ? "bg-marca/10" : "bg-transparent"
                      }`}
                    >
                      <UserAvatar name={user.name} size="sm" />
                      <span className="text-text-primary font-body max-w-25 truncate text-sm font-semibold">
                        {user.name.split(" ")[0]}
                      </span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        className={`text-text-muted/50 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                      >
                        <path
                          d="M2 4l4 4 4-4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
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
                      onClick={() => onOpenAuth("register")}
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
                  <a href="/perfil" className="flex items-center">
                    <UserAvatar name={user.name} size="sm" />
                  </a>
                )}
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="text-text-secondary/70 bg-marca/6 rounded-lg p-2 transition-colors duration-150"
                  aria-label="Abrir menú"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M3 5h14M3 10h14M3 15h14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
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
      />
    </>
  );
}
