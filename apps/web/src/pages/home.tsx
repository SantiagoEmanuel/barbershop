import { cn, SectionHeader, Spinner, UserAvatar } from "@config/components";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import BookingModal from "../components/bookingModal";
import { formatARS } from "../components/ui/formatters";
import { api } from "../lib/api";
import { useBookingStore } from "../store/useBookingStore";
import { useServicesStore } from "../store/useServicesStore";
import type { ApiResponse, Barber } from "../types";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const openBooking = useBookingStore((s) => s.openModal);
  const setService = useBookingStore((s) => s.setService);
  const setBarber = useBookingStore((s) => s.setBarber);
  const services = useServicesStore((s) => s.services);
  const getServices = useServicesStore((s) => s.getServices);
  const [barbers, setBarbers] = useState<Barber[] | null>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const barbersRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getServices();
    api<ApiResponse<Barber[]>>("barber").then((r) => setBarbers(r?.data ?? []));
  }, [getServices]);

  useGSAP(
    () => {
      if (!services?.length) return;
      gsap.fromTo(
        ".service-card",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: servicesRef.current,
            start: "top 85%",
          },
        },
      );
    },
    { scope: servicesRef, dependencies: [services] },
  );

  useGSAP(
    () => {
      if (!barbers?.length) return;
      gsap.fromTo(
        ".barber-card",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: barbersRef.current,
            start: "top 85%",
          },
        },
      );
    },
    { scope: barbersRef, dependencies: [barbers] },
  );

  useGSAP(
    () => {
      gsap.fromTo(
        ctaRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 85%",
          },
        },
      );
    },
    { scope: ctaRef },
  );

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  }

  return (
    <>
      <section className="relative mx-auto flex min-h-full max-w-4xl flex-col justify-between overflow-hidden px-5 pt-10 pb-8 sm:px-10 sm:pt-16">
        <img
          src="/scissors_icon.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-[-15%] z-0 hidden w-md -translate-y-1/2 rotate-90 opacity-[0.2] select-none sm:right-0 sm:block lg:w-xl"
        />

        <div className="via-marca/40 absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent to-transparent" />

        <div className="relative z-10 flex max-w-4xl flex-col gap-6 text-balance">
          <div className="flex items-center gap-3">
            <span className="line-marca" />
            <p className="text-marca font-body text-[10px] tracking-[0.25em] uppercase sm:text-xs">
              Desde 2020 · Quimilí
            </p>
          </div>

          <h1
            className="font-display text-text-primary flex flex-col gap-1 leading-[1.05] font-bold"
            style={{
              fontSize: "clamp(2.25rem, 7vw, 4.5rem)",
            }}
          >
            <span>Reserva tu turno,</span>
            <span className="text-marca font-normal italic">
              del resto nos encargamos nosotros.
            </span>
          </h1>

          <p className="text-text-muted font-body max-w-sm text-sm leading-relaxed sm:text-base">
            Desde 2020 ofreciendo puntualidad, atención personalizada y un corte
            pensado para vos en Quimilí.
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
              className="btn-ghost rounded-xl px-7 py-3.5 text-base"
            >
              Ver servicios →
            </button>
          </div>
        </div>
      </section>

      <section
        ref={servicesRef}
        id="servicios"
        className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-10 sm:py-16"
      >
        <div className="mb-8 text-balance sm:mb-10">
          <SectionHeader
            eyebrow="Servicios"
            title="Elegí tu servicio"
            description="Selecciona el servicio que necesitas y reserva tu turno en menos de un minuto."
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
                onClick={() => {
                  setService(s.id, s.name, s.price, s.durationMinutes);
                  openBooking();
                }}
                className={`service-card bg-surface border-border hover:border-marca/35 group flex flex-col justify-center gap-3 rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] ${i === 0 ? "sm:col-span-full" : ""}`}
              >
                <div className="flex w-full items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className={cn("size-10 rounded-full border")}>
                      <img
                        src="scissors_icon.png"
                        className="bg-marca h-auto w-full rounded-full p-1.5"
                      />
                    </span>
                    <div>
                      <p
                        className={`text-marca font-display font-bold uppercase ${i === 0 ? "text-xl sm:text-2xl" : "text-base sm:text-lg"}`}
                      >
                        {s.name}
                      </p>
                      {s.description && (
                        <p className="text-text-muted font-body mt-1 text-xs leading-relaxed uppercase">
                          {s.description}
                        </p>
                      )}
                    </div>
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
                <p className="text-marca font-body mt-auto text-xs font-semibold opacity-35 transition-opacity duration-200 group-hover:opacity-100">
                  Reservar →
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      <section
        ref={barbersRef}
        id="barberos"
        className="bg-surface/40 border-border mx-auto w-full max-w-4xl rounded-none border-y px-4 md:rounded-2xl"
      >
        <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-10 sm:py-16">
          <div className="mb-8 sm:mb-10">
            <SectionHeader
              eyebrow="El equipo"
              title="Personal disponible"
              description="Encargados de que salgas fachero."
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
                <button
                  key={b.id}
                  type="button"
                  aria-label={`Reservar turno con ${b.name}`}
                  className="barber-card bg-surface border-border hover:border-marca/30 focus-visible:border-marca flex flex-col gap-3 rounded-2xl border p-5 text-left transition-colors duration-200"
                  onClick={() => {
                    setBarber(b.id, b.name);
                    openBooking();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar name={b.name} size="lg" />
                    <div className="min-w-0">
                      <p className="text-text-primary font-display text-base font-bold uppercase">
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
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <div
          ref={ctaRef}
          className="bg-surface border-border-strong relative mx-auto flex w-full flex-col items-center gap-5 overflow-hidden rounded-2xl border px-6 py-10 text-center sm:px-12 sm:py-14"
        >
          <span
            aria-hidden
            className="bg-marca/8 text-marca pointer-events-none absolute -top-12 -right-12 flex size-44 items-center justify-center rounded-full text-6xl opacity-30"
          >
            ✂
          </span>
          <div className="relative z-10 flex flex-col gap-2">
            <h3 className="font-display text-text-primary text-2xl font-bold sm:text-3xl">
              ¿Listo para un nuevo look? ✂️
            </h3>
            <div>
              <p className="text-text-muted font-body max-w-md text-sm sm:text-base">
                Reserva tu turno en menos de un minuto.
              </p>
              <p className="text-text-muted font-body max-w-md text-sm sm:text-base">
                Rápido, fácil y sin complicaciones.
              </p>
            </div>
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
