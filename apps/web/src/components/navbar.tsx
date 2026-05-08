import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MobileDrawer } from "./mobileDrawer";
import { UserAvatar } from "./ui/avatar";
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
    window.addEventListener("scroll", onScroll, {
      passive: true,
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      <header
        className="fixed top-0 right-0 left-0 z-100 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(39,38,48,0.95)" : "rgba(39,38,48,0.6)",
          backdropFilter: "blur(12px)",
          borderBottom: scrolled
            ? "1px solid rgba(248,223,176,0.1)"
            : "1px solid transparent",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between sm:h-16">
            {}
            <a
              href="/"
              className="flex shrink-0 items-center gap-2.5"
              style={{
                textDecoration: "none",
              }}
            >
              {}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  color: "#F8DFB0",
                  flexShrink: 0,
                }}
              >
                <circle
                  cx="6"
                  cy="6"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
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

              <span
                className="tracking-wide"
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#EFEEDE",
                  letterSpacing: "0.04em",
                }}
              >
                <span
                  style={{
                    color: "#F8DFB0",
                  }}
                >
                  PEKO BARBER
                </span>
              </span>
            </a>

            {}
            <nav className="hidden items-center gap-7 md:flex">
              {[
                {
                  href: "#servicios",
                  label: "Servicios",
                },
                {
                  href: "#barberos",
                  label: "Barberos",
                },
                {
                  href: "#nosotros",
                  label: "Nosotros",
                },
              ].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm font-medium transition-colors duration-200"
                  style={{
                    color: "rgba(203,197,193,0.75)",
                    fontFamily: "'Nunito', sans-serif",
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "#F8DFB0";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "rgba(203,197,193,0.75)";
                  }}
                >
                  {l.label}
                </a>
              ))}
            </nav>

            {}
            <div className="flex items-center gap-2 sm:gap-3">
              {}
              <div className="hidden items-center gap-2.5 md:flex">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen((v) => !v)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all duration-200"
                      style={{
                        background: userMenuOpen
                          ? "rgba(248,223,176,0.1)"
                          : "transparent",
                        border: "1px solid rgba(248,223,176,0.12)",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "rgba(248,223,176,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        if (!userMenuOpen)
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "transparent";
                      }}
                    >
                      <UserAvatar name={user.name} size="sm" />
                      <span
                        className="max-w-25 truncate text-sm font-semibold"
                        style={{
                          color: "#EFEEDE",
                          fontFamily: "'Nunito', sans-serif",
                        }}
                      >
                        {user.name.split(" ")[0]}
                      </span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="transition-transform duration-200"
                        style={{
                          color: "rgba(203,197,193,0.5)",
                          transform: userMenuOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        }}
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
                      className="rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-200"
                      style={{
                        color: "rgba(203,197,193,0.85)",
                        fontFamily: "'Nunito', sans-serif",
                        background: "transparent",
                        border: "1px solid rgba(248,223,176,0.15)",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "rgba(248,223,176,0.35)";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "#F8DFB0";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "rgba(248,223,176,0.15)";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "rgba(203,197,193,0.85)";
                      }}
                    >
                      Ingresar
                    </button>
                    <button
                      onClick={() => onOpenAuth("register")}
                      className="rounded-lg px-4 py-1.5 text-sm font-bold transition-all duration-200 active:scale-[0.97]"
                      style={{
                        background: "#F8DFB0",
                        color: "#272630",
                        fontFamily: "'Nunito', sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "#F0D49A";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "#F8DFB0";
                      }}
                    >
                      Sacar turno
                    </button>
                  </>
                )}
              </div>

              {}
              <div className="flex items-center gap-2 md:hidden">
                {user && (
                  <a href="/perfil" className="flex items-center">
                    <UserAvatar name={user.name} size="sm" />
                  </a>
                )}
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="rounded-lg p-2 transition-colors duration-150"
                  style={{
                    color: "rgba(203,197,193,0.7)",
                    background: "rgba(248,223,176,0.06)",
                  }}
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

      {}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenAuth={onOpenAuth}
      />
    </>
  );
}
