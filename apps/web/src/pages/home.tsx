import { useEffect } from "react";
import BookingModal from "../components/bookingModal";
import { formatARS } from "../components/ui/formatters";
import { useBookingStore } from "../store/useBookingStore";
import { useServicesStore } from "../store/useServicesStore";

const STATS = [
  { num: "10+", label: "Años de experiencia" },
  { num: "3", label: "Barberos especializados" },
  { num: "5k+", label: "Clientes atendidos" },
  { num: "5★", label: "Valoración promedio" },
];

export default function Home() {
  const openBooking = useBookingStore((s) => s.openModal);
  const services = useServicesStore((s) => s.services);
  const getServices = useServicesStore((s) => s.getServices);

  useEffect(() => {
    getServices();
  }, [getServices]);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[85dvh] flex-col justify-between overflow-hidden px-5 pt-10 pb-8 sm:px-10 sm:pt-16">
        {/* Tijera decorativa de fondo */}

        <img
          src="scissors_icon.png"
          alt="scissors icon bg"
          className="text-marca/3 font-display [clamp(18rem, 50vw, 38rem)] pointer-events-none absolute top-1/2 right-0 z-0 -translate-y-1/2 rotate-90 leading-none opacity-30 select-none"
        />

        {/* Línea decorativa superior */}
        <div className="via-marca/40 absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent to-transparent" />

        <div className="relative z-10 flex max-w-xl flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="line-marca" />
            <p className="text-marca font-body text-xs tracking-[0.25em] uppercase">
              Desde 2014 · Quimilí
            </p>
          </div>

          <h1
            className="font-display text-text-primary leading-[1.05] font-bold"
            style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)" }}
          >
            Siéntate, saca tu turno y{" "}
            <span className="text-marca font-normal italic">
              déjanos el resto
            </span>{" "}
            a nosotros.
          </h1>

          <p className="text-text-muted font-body max-w-sm text-base leading-relaxed">
            Más de diez años dando forma al estilo de los hombres de Córdoba.
            Sin vueltas, sin esperas, sin sorpresas.
          </p>

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

        {/* Stats grid */}
        <div className="bg-border relative z-10 mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl sm:mt-16 sm:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.num}
              className="bg-surface flex flex-col gap-1 px-5 py-4"
            >
              <span className="text-marca font-display text-2xl font-bold">
                {s.num}
              </span>
              <span className="text-text-muted font-body text-xs">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Servicios */}
      <section
        id="servicios"
        className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-10"
      >
        <div className="mb-8 flex flex-col gap-2">
          <span className="badge-marca">Nuestros servicios</span>
          <h2 className="font-display text-text-primary text-[1.75rem] font-bold">
            ¿Qué necesitás hoy?
          </h2>
        </div>

        {services && services.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <button
                key={s.id}
                onClick={openBooking}
                className={`card hover:border-border-strong group flex flex-col gap-3 text-left transition-all duration-200 hover:-translate-y-px ${
                  i === 0 ? "sm:col-span-full" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p
                      className={`text-marca font-display font-bold ${i === 0 ? "text-[1.2rem]" : "text-base"}`}
                    >
                      {s.name}
                    </p>
                    {s.description && (
                      <p className="text-text-muted font-body mt-1 text-sm leading-relaxed">
                        {s.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-text-primary font-display text-lg font-bold">
                      {formatARS(s.price)}
                    </p>
                    <p className="text-text-muted font-body text-xs">
                      {s.durationMinutes} min
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="bg-marca/8 border-border flex size-12 items-center justify-center rounded-full border">
              ✂️
            </div>
            <p className="text-text-muted font-body">Cargando servicios...</p>
          </div>
        )}
      </section>

      {/* CTA final */}
      <section className="bg-surface border-border-strong mx-4 mb-14 flex flex-col items-center justify-between gap-6 rounded-2xl border px-6 py-10 sm:mx-10 sm:flex-row sm:px-12 sm:py-12">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <h3 className="font-display text-text-primary text-[1.4rem] font-bold">
            ¿Listo para verte bien?
          </h3>
          <p className="text-text-muted font-body text-[0.9rem]">
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

      <BookingModal />
    </>
  );
}
