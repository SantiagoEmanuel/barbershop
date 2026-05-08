import { FooterCol } from "../footerCol";
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="mt-auto"
      style={{
        background: "#1E1D28",
        borderTop: "1px solid rgba(248,223,176,0.07)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        {}
        <div className="mb-8 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {}
          <div className="flex max-w-xs flex-col gap-3">
            <div className="flex items-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  color: "#F8DFB0",
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
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 700,
                  fontSize: "1rem",
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
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{
                color: "#8B8899",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Tu barbero de confianza en Quimilí. Más de diez años cuidando tu
              estilo sin vueltas ni demoras.
            </p>
          </div>

          {}
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 sm:gap-x-16">
            <FooterCol
              title="Navegación"
              links={[
                {
                  href: "/",
                  label: "Inicio",
                },
                {
                  href: "#servicios",
                  label: "Servicios",
                },
                {
                  href: "/barberos",
                  label: "Barberos",
                },
                {
                  href: "/nosotros",
                  label: "Nosotros",
                },
              ]}
            />
            <FooterCol
              title="Tu cuenta"
              links={[
                {
                  href: "/perfil",
                  label: "Mi perfil",
                },
                {
                  href: "/mis-turnos",
                  label: "Mis turnos",
                },
              ]}
            />
          </div>
        </div>

        {}
        <div
          style={{
            borderTop: "1px solid rgba(248,223,176,0.06)",
          }}
          className="pt-6"
        >
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p
              className="text-xs"
              style={{
                color: "#8B8899",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              © {year} Peko Barber · Quimilí, Argentina
            </p>
            <p
              className="text-xs"
              style={{
                color: "rgba(139,136,153,0.5)",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Hecho con ♥ por{" "}
              <span
                style={{
                  color: "rgba(248,223,176,0.5)",
                }}
              >
                tu barbero amigo
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
