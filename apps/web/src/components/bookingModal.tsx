import { useEffect, useState } from "react";
import { api, post } from "../lib/api";
import { cn } from "../lib/cn";
import { timeToMinutes } from "../lib/timeTominutes";
import { useBookingStore } from "../store/useBookingStore";
import type { ApiResponse, Barber, Service, Slot } from "../types";
import { ModalBase } from "./modalBase";
import { Field } from "./ui/field";
import { formatARS, todayISO } from "./ui/formatters";
import { Spinner } from "./ui/spinner";

// ── Helpers de tiempo ─────────────────────────────────────────
function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function toTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Filtra slots crudos a slots válidos donde "cabe" un servicio de `duration` min.
 * Asume que los slots crudos vienen en steps regulares (típico: 10 min).
 */
function filterValidSlots(slots: Slot[], duration: number): Slot[] {
  if (slots.length === 0) return [];
  const effectiveDuration = Math.max(duration, 30);
  const rawStep =
    slots.length >= 2
      ? toMin(slots[1]!.startTime) - toMin(slots[0]!.startTime)
      : 10;
  const slotsNeeded = Math.ceil(effectiveDuration / rawStep);
  const startTimes = new Set(slots.map((s) => s.startTime));
  const valid: Slot[] = [];
  for (let i = 0; i < slots.length; i++) {
    const candidate = slots[i]!;
    const startMin = toMin(candidate.startTime);
    let consecutive = true;
    for (let k = 1; k < slotsNeeded; k++) {
      const needed = toTime(startMin + k * rawStep);
      if (!startTimes.has(needed)) {
        consecutive = false;
        break;
      }
    }
    if (consecutive) {
      valid.push({
        startTime: candidate.startTime,
        endTime: toTime(startMin + effectiveDuration),
      });
    }
  }
  return valid;
}

// ── Indicador de pasos ────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const state =
          current > i ? "done" : current === i ? "current" : "pending";
        const stateClass =
          state === "done"
            ? "w-6 bg-marca"
            : state === "current"
              ? "w-2 bg-marca/50"
              : "w-2 bg-marca/15";
        return (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${stateClass}`}
          />
        );
      })}
    </div>
  );
}

// ── Step 1: barbero ───────────────────────────────────────────
function StepBarber({ onNext }: { onNext: () => void }) {
  const { barberId, setBarber } = useBookingStore();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<ApiResponse<Barber[]>>("barber").then((r) => {
      setBarbers(r?.data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-marca font-body mb-1 text-xs tracking-[0.15em] uppercase">
          Paso 1 de 4
        </p>
        <h3 className="font-display text-text-primary text-xl font-bold">
          ¿Con quién te cortás?
        </h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size={24} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {barbers.map((b) => {
            const selected = barberId === b.id;
            return (
              <button
                key={b.id}
                onClick={() => {
                  setBarber(b.id, b.name);
                  onNext();
                }}
                className={`flex items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all duration-150 ${
                  selected
                    ? "bg-marca/10 border-border-strong"
                    : "border-border bg-black/20"
                }`}
              >
                <div className="bg-marca/12 text-marca border-marca/20 flex size-11 shrink-0 items-center justify-center rounded-full border text-sm font-bold">
                  {b.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary font-body text-sm font-semibold">
                    {b.name}
                  </p>
                  {b.experienceYears != null && (
                    <p className="text-text-muted mt-0.5 text-xs">
                      {b.experienceYears} años de experiencia
                    </p>
                  )}
                  {b.bio && (
                    <p className="text-text-muted mt-0.5 truncate text-xs">
                      {b.bio}
                    </p>
                  )}
                </div>
                {selected && <span className="text-marca">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Step 2: servicio ──────────────────────────────────────────
function StepService({ onNext }: { onNext: () => void }) {
  const { serviceId, setService } = useBookingStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<ApiResponse<Service[]>>("service").then((r) => {
      setServices(r?.data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-marca font-body mb-1 text-xs tracking-[0.15em] uppercase">
          Paso 2 de 4
        </p>
        <h3 className="font-display text-text-primary text-xl font-bold">
          ¿Qué vas a hacer hoy?
        </h3>
        <p className="text-text-muted font-body mt-1 text-xs">
          El horario disponible se adapta a la duración del servicio.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size={24} />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {services.map((s) => {
            const selected = serviceId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setService(s.id, s.name, s.price, s.durationMinutes);
                  onNext();
                }}
                className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-all duration-150 ${
                  selected
                    ? "bg-marca/10 border-border-strong"
                    : "border-border bg-black/20"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary font-body text-sm font-semibold">
                    {s.name}
                  </p>
                  {s.description && (
                    <p className="text-text-muted mt-0.5 truncate text-xs">
                      {s.description}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-marca font-body text-sm font-bold">
                    {formatARS(s.price)}
                  </p>
                  <p className="text-text-muted text-xs">
                    {s.durationMinutes} min
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Step 3: fecha + slot ──────────────────────────────────────
function StepDateTime({ onNext }: { onNext: () => void }) {
  const { barberId, serviceDuration, date, startTime, setDate, setSlot } =
    useBookingStore();
  const [rawSlots, setRawSlots] = useState<Slot[]>([]);
  const [validSlots, setValidSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!date || !barberId) return;
    setLoadingSlots(true);
    setSlot("");
    api<ApiResponse<{ slots: Slot[] }>>(
      `availability?barberId=${barberId}&date=${date}`,
    )
      .then((r) => {
        const slots = r?.data?.slots ?? [];
        setRawSlots(slots);
        setValidSlots(filterValidSlots(slots, serviceDuration));
      })
      .finally(() => setLoadingSlots(false));
  }, [date, barberId]);

  useEffect(() => {
    if (rawSlots.length > 0) {
      setValidSlots(filterValidSlots(rawSlots, serviceDuration));
    }
  }, [serviceDuration, rawSlots]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-marca font-body mb-1 text-xs tracking-[0.15em] uppercase">
          Paso 3 de 4
        </p>
        <h3 className="font-display text-text-primary text-xl font-bold">
          ¿Cuándo venís?
        </h3>
      </div>

      <div>
        <label className="text-text-muted font-body mb-2 block text-xs font-semibold tracking-wide uppercase">
          Fecha
        </label>
        <input
          type="date"
          min={todayISO()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border-border focus:border-border-strong text-text-primary font-body w-full rounded-xl border bg-black/25 px-4 py-3 text-sm scheme-dark transition-all duration-200 outline-none"
        />
      </div>

      {date && (
        <div>
          <label className="text-text-muted font-body mb-2 block text-xs font-semibold tracking-wide uppercase">
            Horario disponible
          </label>

          {loadingSlots ? (
            <div className="flex justify-center py-6">
              <Spinner size={20} />
            </div>
          ) : validSlots.length === 0 ? (
            <div className="border-border text-text-muted font-body rounded-xl border bg-black/20 px-4 py-5 text-center text-sm">
              No hay turnos disponibles para ese día. Probá con otra fecha.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {validSlots.map((s) => {
                  if (
                    timeToMinutes(s.startTime) <
                      new Date().getHours() * 60 + new Date().getMinutes() &&
                    date === todayISO()
                  ) {
                    return;
                  }
                  const selected = startTime === s.startTime;
                  return (
                    <button
                      key={s.startTime}
                      onClick={() => {
                        setSlot(s.startTime);
                        onNext();
                      }}
                      className={cn(
                        "font-body rounded-xl border py-2.5 text-sm font-semibold transition-all duration-150",
                        selected
                          ? "bg-marca/15 border-border-strong text-marca"
                          : "border-border text-text-secondary bg-black/20",
                      )}
                    >
                      {s.startTime}
                    </button>
                  );
                })}
              </div>
              <p className="text-text-muted font-body mt-2 text-center text-xs">
                Mostrando turnos donde cabe tu servicio de{" "}
                {Math.max(serviceDuration, 30)} min.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Step 4: datos cliente ─────────────────────────────────────
function StepClient({ onNext }: { onNext: () => void }) {
  const { clientEmail, clientName, clientPhone, notes, setClient } =
    useBookingStore();
  const [email, setEmail] = useState(clientEmail);
  const [name, setName] = useState(clientName);
  const [phone, setPhone] = useState(clientPhone);
  const [note, setNote] = useState(notes);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setClient(name.trim(), phone.trim(), note.trim(), email.trim());
    onNext();
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-marca font-body mb-1 text-xs tracking-[0.15em] uppercase">
          Paso 4 de 4
        </p>
        <h3 className="font-display text-text-primary text-xl font-bold">
          Tus datos
        </h3>
        <p className="text-text-muted font-body mt-1 text-xs">
          Solo para avisarte si hay algún cambio. Nada más.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field
          label="Email *"
          type="email"
          placeholder="tu-correo@gmail.com"
          autoFocus
          value={email}
          onChange={setEmail}
          required
        />
        <Field
          label="Nombre completo *"
          type="text"
          placeholder="Juan Pérez"
          className="capitalize"
          value={name}
          onChange={setName}
          required
        />
        <Field
          label="Teléfono *"
          type="tel"
          placeholder="+54 9 351 000 0000"
          value={phone}
          onChange={setPhone}
          required
        />
        <div>
          <label className="text-text-muted font-body mb-1.5 block text-xs font-semibold tracking-wide uppercase">
            Algo que quieras aclarar
          </label>
          <textarea
            placeholder="Opcional — decile algo al barbero"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="border-border focus:border-border-strong text-text-primary font-body w-full resize-none rounded-xl border bg-black/25 px-4 py-3 text-sm capitalize transition-all duration-200 outline-none"
          />
        </div>
        <button
          type="submit"
          className="btn-marca mt-1 w-full rounded-xl py-3.5"
        >
          Ver resumen →
        </button>
      </form>
    </div>
  );
}

// ── Step 5: confirmar ─────────────────────────────────────────
function StepConfirm({ onClose }: { onClose: () => void }) {
  const store = useBookingStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      const res = await post("appointments", {
        barberId: store.barberId,
        serviceId: store.serviceId,
        date: store.date,
        startTime: store.startTime,
        clientName: store.clientName,
        clientPhone: store.clientPhone,
        clientEmail: store.clientEmail,
        notes: store.notes,
      });
      if (!res) throw new Error("Error al reservar el turno");
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="bg-success/12 border-success/30 text-success flex size-16 items-center justify-center rounded-full border text-2xl">
          ✓
        </div>
        <div>
          <h3 className="font-display text-text-primary mb-1 text-xl font-bold">
            ¡Listo, estás anotado!
          </h3>
          <p className="text-text-muted font-body text-sm">
            Te esperamos el{" "}
            <strong className="text-text-primary">
              {new Date(store.date).toLocaleDateString("es-AR", {
                timeZone: "America/Argentina/Buenos_Aires",
              })}
            </strong>{" "}
            a las{" "}
            <strong className="text-text-primary">{store.startTime}</strong> con{" "}
            <strong className="text-marca">{store.barberName}</strong>.
          </p>
        </div>
        <button
          className="btn-marca w-full rounded-xl py-3.5"
          onClick={() => {
            store.reset();
            onClose();
          }}
        >
          Perfecto, ¡hasta entonces!
        </button>
      </div>
    );
  }

  const rows = [
    { label: "Barbero", value: store.barberName },
    { label: "Servicio", value: store.serviceName },
    { label: "Precio", value: formatARS(store.servicePrice) },
    {
      label: "Fecha",
      value: new Date(store.date).toLocaleDateString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
      }),
    },
    { label: "Hora", value: store.startTime },
    { label: "Nombre", value: store.clientName },
    { label: "Teléfono", value: store.clientPhone },
    ...(store.notes ? [{ label: "Notas", value: store.notes }] : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-display text-text-primary text-xl font-bold">
        Confirmá tu turno
      </h3>
      <div className="border-border divide-border overflow-hidden rounded-xl border">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={`flex items-center justify-between px-4 py-2.5 ${
              i % 2 === 0 ? "bg-black/15" : "bg-transparent"
            }`}
          >
            <span className="text-text-muted font-body text-xs font-semibold">
              {r.label}
            </span>
            <span className="text-text-primary font-body text-sm font-medium">
              {r.value}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-error/10 border-border-error text-error font-body rounded-xl border px-3 py-2.5 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={loading}
        className="btn-marca flex w-full items-center justify-center gap-2 rounded-xl py-3.5 disabled:opacity-70"
      >
        {loading ? <Spinner size={16} /> : "Confirmar turno ✓"}
      </button>
    </div>
  );
}

// ── Modal raíz ────────────────────────────────────────────────
export default function BookingModal() {
  const { isOpen, step, setStep, closeModal, reset } = useBookingStore();

  function handleClose() {
    reset();
    closeModal();
  }

  return (
    <ModalBase open={isOpen} onClose={handleClose} maxW="max-w-md">
      <div className="border-border flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-3">
          {step > 1 && step < 5 && (
            <button
              onClick={() => setStep((step - 1) as typeof step)}
              className="text-text-muted font-body flex items-center gap-1 text-xs font-semibold transition-colors duration-150"
            >
              ← Volver
            </button>
          )}
          <StepDots current={step - 1} total={4} />
        </div>
        <button
          onClick={handleClose}
          className="text-text-muted bg-marca/6 flex size-7 items-center justify-center rounded-lg text-sm transition-colors duration-150"
        >
          ✕
        </button>
      </div>

      <div className="max-h-[75dvh] overflow-y-auto px-5 py-5">
        {step === 1 && <StepBarber onNext={() => setStep(2)} />}
        {step === 2 && <StepService onNext={() => setStep(3)} />}
        {step === 3 && <StepDateTime onNext={() => setStep(4)} />}
        {step === 4 && <StepClient onNext={() => setStep(5)} />}
        {step === 5 && <StepConfirm onClose={handleClose} />}
      </div>
    </ModalBase>
  );
}
