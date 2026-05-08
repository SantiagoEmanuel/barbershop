import { useEffect } from "react";
import BookingModal from "../components/bookingModal";
import { formatARS } from "../components/ui/formatters";
import { useService } from "../hooks/useService";
import { useBookingStore } from "../store/useBookingStore";
export default function Home() {
  const openBooking = useBookingStore((s) => s.openModal);
  const { getServices, service } = useService();
  useEffect(() => {
    getServices();
  }, []);
  return (
    <>
      {}
      <section className="relative flex min-h-[85dvh] flex-col justify-between overflow-hidden px-5 pt-10 pb-8 sm:px-10 sm:pt-16">
        {}
        <div
          className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 select-none"
          style={{
            fontSize: "clamp(18rem, 50vw, 38rem)",
            lineHeight: 1,
            color: "rgba(248,223,176,0.03)",
            fontFamily: "var(--font-display)",
            zIndex: 0,
          }}
          aria-hidden
        >
          ✂
        </div>

        {}
        <div
          className="absolute top-0 right-0 left-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--color-marca) 30%, var(--color-marca-deep) 50%, var(--color-marca) 70%, transparent)",
            opacity: 0.4,
          }}
        />

        <div className="relative z-10 flex max-w-xl flex-col gap-6">
          {}
          <div className="flex items-center gap-3">
            <span className="line-marca" />
            <p
              className="text-xs tracking-[0.25em] uppercase"
              style={{
                color: "var(--color-marca)",
                fontFamily: "var(--font-body)",
              }}
            >
              Desde 2014 · Quimilí
            </p>
          </div>

          {}
          <h1
            className="leading-[1.05]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
            }}
          >
            Siéntate, saca tu turno y{" "}
            <span
              className="italic"
              style={{
                color: "var(--color-marca)",
                fontWeight: 400,
              }}
            >
              déjanos el resto
            </span>{" "}
            a nosotros.
          </h1>

          <p
            className="max-w-sm text-base leading-relaxed"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Más de diez años dando forma al estilo de los hombres de Córdoba.
            Sin vueltas, sin esperas, sin sorpresas.
          </p>

          {}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={openBooking}
              className="btn-marca rounded-xl px-7 py-3.5 text-base"
            >
              Sacar turno
            </button>
            <button
              onClick={() =>
                document.getElementById("servicios")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="btn-ghost rounded-xl px-6 py-3 text-sm"
            >
              Ver servicios →
            </button>
          </div>
        </div>

        {}
        <div
          className="relative z-10 mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl sm:mt-16 sm:grid-cols-4"
          style={{
            background: "var(--color-border)",
          }}
        >
          {[
            {
              num: "10+",
              label: "Años de experiencia",
            },
            {
              num: "3",
              label: "Barberos especializados",
            },
            {
              num: "5k+",
              label: "Clientes atendidos",
            },
            {
              num: "5★",
              label: "Valoración promedio",
            },
          ].map((s) => (
            <div
              key={s.num}
              className="flex flex-col gap-1 px-5 py-4"
              style={{
                background: "var(--color-surface)",
              }}
            >
              <span
                className="text-2xl font-bold"
                style={{
                  color: "var(--color-marca)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {s.num}
              </span>
              <span
                className="text-xs"
                style={{
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {}
      <section
        id="servicios"
        className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-10"
      >
        <div className="mb-8 flex flex-col gap-2">
          <span className="badge-marca">Nuestros servicios</span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.75rem",
              color: "var(--color-text-primary)",
            }}
          >
            ¿Qué necesitás hoy?
          </h2>
        </div>

        {service && service.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {service.map((s, i) => (
              <button
                key={s.id}
                onClick={openBooking}
                className="card group flex flex-col gap-3 text-left transition-all duration-200"
                style={
                  i === 0
                    ? {
                        gridColumn: "1 / -1",
                      }
                    : {}
                }
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "var(--color-border-strong)";
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "var(--color-border)";
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateY(0)";
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p
                      className="font-bold"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: i === 0 ? "1.2rem" : "1rem",
                        color: "var(--color-marca)",
                      }}
                    >
                      {s.name}
                    </p>
                    {s.description && (
                      <p
                        className="mt-1 text-sm leading-relaxed"
                        style={{
                          color: "var(--color-text-muted)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {s.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className="text-lg font-bold"
                      style={{
                        color: "var(--color-text-primary)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {formatARS(s.price)}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {s.durationMinutes} min
                    </p>
                  </div>
                </div>
                <p
                  className="mt-auto text-xs font-semibold"
                  style={{
                    color: "var(--color-marca)",
                    fontFamily: "var(--font-body)",
                    opacity: 0,
                  }}
                  ref={(el) => {
                    if (el) el.style.opacity = "0";
                  }}
                >
                  Reservar →
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12">
            <div
              className="flex size-12 items-center justify-center rounded-full"
              style={{
                background: "rgba(248,223,176,0.08)",
                border: "1px solid var(--color-border)",
              }}
            >
              ✂️
            </div>
            <p
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              Cargando servicios...
            </p>
          </div>
        )}
      </section>

      {}
      <section
        className="mx-4 mb-14 flex flex-col items-center justify-between gap-6 rounded-2xl px-6 py-10 sm:mx-10 sm:flex-row sm:px-12 sm:py-12"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border-strong)",
        }}
      >
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.4rem",
              color: "var(--color-text-primary)",
            }}
          >
            ¿Listo para verte bien?
          </h3>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
            }}
          >
            Reservá tu turno en menos de un minuto. Sin cuentas, sin vueltas.
          </p>
        </div>
        <button
          onClick={openBooking}
          className="btn-marca shrink-0 rounded-xl px-8 py-3.5 text-base"
        >
          Sacar turno ahora
        </button>
      </section>

      {}
      <BookingModal />
    </>
  );
}
