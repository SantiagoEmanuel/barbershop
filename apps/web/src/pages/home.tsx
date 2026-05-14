import { useEffect, useState } from "react";
import BookingModal from "../components/bookingModal";
import { UserAvatar } from "../components/ui/avatar";
import { formatARS } from "../components/ui/formatters";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api } from "../lib/api";
import { useBookingStore } from "../store/useBookingStore";
import { useServicesStore } from "../store/useServicesStore";
import type { ApiResponse, Barber } from "../types";

const STATS = [
  { num: "5+", label: "Años de experiencia" },
  { num: "1", label: "Barberos especializados" },
  { num: "5k+", label: "Clientes atendidos" },
  { num: "5★", label: "Valoración promedio" },
];

export default function Home() {
  const openBooking = useBookingStore((s) => s.openModal);
  const services = useServicesStore((s) => s.services);
  const getServices = useServicesStore((s) => s.getServices);
  const [barbers, setBarbers] = useState<Barber[] | null>(null);

  useEffect(() => {
    getServices();
    api<ApiResponse<Barber[]>>("barber").then((r) => setBarbers(r?.data ?? []));
  }, [getServices]);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative mx-auto flex min-h-[85dvh] max-w-4xl flex-col justify-between overflow-hidden px-5 pt-10 pb-8 sm:px-10 sm:pt-16">
        {/* Tijera decorativa de fondo */}
        <img
          src="/scissors_icon.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-[-15%] z-0 hidden w-md -translate-y-1/2 rotate-90 opacity-[0.2] select-none sm:right-0 sm:block lg:w-xl"
        />

        {/* Línea decorativa superior */}
        <div className="via-marca/40 absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent to-transparent" />

        <div className="relative z-10 flex max-w-xl flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="line-marca" />
            <p className="text-marca font-body text-[10px] tracking-[0.25em] uppercase sm:text-xs">
              Desde 2020 · Quimilí
            </p>
          </div>

          <h1
            className="font-display text-text-primary leading-[1.05] font-bold"
            style={{ fontSize: "clamp(2.25rem, 7vw, 4.5rem)" }}
          >
            Siéntate, saca tu turno y{" "}
            <span className="text-marca font-normal italic">
              déjanos el resto
            </span>{" "}
            a nosotros.
          </h1>

          <p className="text-text-muted font-body max-w-sm text-sm leading-relaxed sm:text-base">
            Más de cinco años dando forma al estilo de los hombres de Quimilí.
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
              onClick={() => scrollTo("servicios")}
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
              className="bg-surface flex flex-col gap-1 px-4 py-4 sm:px-5"
            >
              <span className="text-marca font-display text-xl font-bold sm:text-2xl">
                {s.num}
              </span>
              <span className="text-text-muted font-body text-[11px] leading-tight sm:text-xs">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Servicios ─────────────────────────────────────────── */}
      <section
        id="servicios"
        className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-10 sm:py-16"
      >
        <div className="mb-8 sm:mb-10">
          <SectionHeader
            eyebrow="Nuestros servicios"
            title="¿Qué necesitás hoy?"
            description="Tocá un servicio para reservar tu turno en menos de un minuto."
            align="center"
          />
        </div>

        {services == null ? (
          <div className="flex justify-center py-12">
            <Spinner size={28} />
          </div>
        ) : services.length === 0 ? (
          <p className="text-text-muted font-body text-center text-sm">
            Aún no hay servicios cargados.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <button
                key={s.id}
                onClick={openBooking}
                className={`bg-surface border-border hover:border-marca/35 group flex flex-col gap-3 rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] ${
                  i === 0 ? "sm:col-span-full" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-marca font-display font-bold ${i === 0 ? "text-xl sm:text-2xl" : "text-base sm:text-lg"}`}
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
                    <p className="text-text-primary font-display text-lg font-bold tabular-nums">
                      {formatARS(s.price)}
                    </p>
                    <p className="text-text-muted font-body text-xs">
                      {s.durationMinutes} min
                    </p>
                  </div>
                </div>
                <p className="text-marca font-body mt-auto text-xs font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  Reservar →
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── Barberos ──────────────────────────────────────────── */}
      <section
        id="barberos"
        className="bg-surface/40 border-border mx-auto w-full max-w-4xl rounded-none border-y px-4 md:rounded-2xl"
      >
        <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-10 sm:py-16">
          <div className="mb-8 sm:mb-10">
            <SectionHeader
              eyebrow="El equipo"
              title="Nuestros barberos"
              description="Los que se encargan de que salgas a la calle como nuevo."
              align="center"
            />
          </div>

          {barbers == null ? (
            <div className="flex justify-center py-12">
              <Spinner size={28} />
            </div>
          ) : barbers.length === 0 ? (
            <p className="text-text-muted font-body text-center text-sm">
              Pronto sumamos al equipo.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {barbers.map((b) => (
                <article
                  key={b.id}
                  className="bg-surface border-border hover:border-marca/30 flex flex-col gap-3 rounded-2xl border p-5 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar name={b.name} size="lg" />
                    <div className="min-w-0">
                      <p className="text-text-primary font-display text-base font-bold">
                        {b.name}
                      </p>
                      {b.experienceYears != null && (
                        <p className="text-text-muted font-body text-xs">
                          {b.experienceYears} años de experiencia
                        </p>
                      )}
                    </div>
                  </div>
                  {b.bio && (
                    <p className="text-text-secondary font-body text-sm leading-relaxed">
                      {b.bio}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <div className="bg-surface border-border-strong relative mx-auto flex w-full flex-col items-center gap-5 overflow-hidden rounded-2xl border px-6 py-10 text-center sm:px-12 sm:py-14">
          <span
            aria-hidden
            className="bg-marca/8 text-marca pointer-events-none absolute -top-12 -right-12 flex size-44 items-center justify-center rounded-full text-6xl opacity-30"
          >
            ✂
          </span>
          <div className="relative z-10 flex flex-col gap-2">
            <h3 className="font-display text-text-primary text-2xl font-bold sm:text-3xl">
              ¿Listo para verte bien?
            </h3>
            <p className="text-text-muted font-body max-w-md text-sm sm:text-base">
              Reservá tu turno en menos de un minuto. Sin cuentas, sin vueltas.
            </p>
          </div>
          <button
            onClick={openBooking}
            className="btn-marca relative z-10 rounded-xl px-8 py-3.5 text-base"
          >
            Sacar turno ahora
          </button>
        </div>
      </section>

      <BookingModal />
    </>
  );
}
