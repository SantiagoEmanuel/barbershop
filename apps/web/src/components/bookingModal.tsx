import { useEffect, useState } from "react";
import { api, post } from "../lib/api";
import {
  useBookingStore,
  type Barber,
  type Service,
  type Slot,
} from "../store/useBookingStore";
import { ModalBase } from "./modalBase";
import { Field } from "./ui/field";
import { formatARS, todayISO } from "./ui/formatters";
import { Spinner } from "./ui/spinner";
function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}
function toTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
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
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({
        length: total,
      }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: current > i ? 24 : 8,
            height: 4,
            background:
              current > i
                ? "var(--color-marca)"
                : current === i
                  ? "rgba(248,223,176,0.5)"
                  : "rgba(248,223,176,0.15)",
          }}
        />
      ))}
    </div>
  );
}
function StepBarber({ onNext }: { onNext: () => void }) {
  const { barberId, setBarber } = useBookingStore();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<{
      data: Barber[];
    }>("barber").then((r) => {
      setBarbers(r?.data ?? []);
      setLoading(false);
    });
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p
          className="mb-1 text-xs tracking-[0.15em] uppercase"
          style={{
            color: "var(--color-marca)",
            fontFamily: "var(--font-body)",
          }}
        >
          Paso 1 de 4
        </p>
        <h3
          className="text-xl font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
          }}
        >
          ¿Con quién te cortás?
        </h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner
            size={24}
            style={{
              color: "var(--color-marca)",
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {barbers.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setBarber(b.id, b.name);
                onNext();
              }}
              className="flex items-center gap-3.5 rounded-xl p-3.5 text-left transition-all duration-150"
              style={{
                background:
                  barberId === b.id
                    ? "rgba(248,223,176,0.1)"
                    : "rgba(0,0,0,0.2)",
                border: `1px solid ${barberId === b.id ? "var(--color-border-strong)" : "var(--color-border)"}`,
              }}
            >
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  background: "rgba(248,223,176,0.12)",
                  color: "var(--color-marca)",
                  border: "1px solid rgba(248,223,176,0.2)",
                }}
              >
                {b.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {b.name}
                </p>
                {b.experienceYears != null && (
                  <p
                    className="mt-0.5 text-xs"
                    style={{
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {b.experienceYears} años de experiencia
                  </p>
                )}
                {b.bio && (
                  <p
                    className="mt-0.5 truncate text-xs"
                    style={{
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {b.bio}
                  </p>
                )}
              </div>
              {barberId === b.id && (
                <span
                  style={{
                    color: "var(--color-marca)",
                  }}
                >
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
function StepService({ onNext }: { onNext: () => void }) {
  const { serviceId, setService } = useBookingStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<{
      data: Service[];
    }>("service").then((r) => {
      setServices(r?.data ?? []);
      setLoading(false);
    });
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p
          className="mb-1 text-xs tracking-[0.15em] uppercase"
          style={{
            color: "var(--color-marca)",
            fontFamily: "var(--font-body)",
          }}
        >
          Paso 2 de 4
        </p>
        <h3
          className="text-xl font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
          }}
        >
          ¿Qué vas a hacer hoy?
        </h3>
        <p
          className="mt-1 text-xs"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          El horario disponible se adapta a la duración del servicio.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size={24} />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setService(s.id, s.name, s.price, s.durationMinutes);
                onNext();
              }}
              className="flex items-center justify-between gap-3 rounded-xl p-3.5 text-left transition-all duration-150"
              style={{
                background:
                  serviceId === s.id
                    ? "rgba(248,223,176,0.1)"
                    : "rgba(0,0,0,0.2)",
                border: `1px solid ${serviceId === s.id ? "var(--color-border-strong)" : "var(--color-border)"}`,
              }}
            >
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {s.name}
                </p>
                {s.description && (
                  <p
                    className="mt-0.5 truncate text-xs"
                    style={{
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {s.description}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p
                  className="text-sm font-bold"
                  style={{
                    color: "var(--color-marca)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {formatARS(s.price)}
                </p>
                <p
                  className="text-xs"
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                >
                  {s.durationMinutes} min
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
function StepDateTime({ onNext }: { onNext: () => void }) {
  const { barberId, serviceDuration, date, startTime, setDate, setSlot } =
    useBookingStore();
  const [rawSlots, setRawSlots] = useState<Slot[]>([]);
  const [validSlots, setValidSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const getSlots = () => {
    setLoadingSlots(true);
    setSlot("");
    api<{
      data: {
        slots: Slot[];
      };
    }>(`availability?barberId=${barberId}&date=${date}`)
      .then((r) => {
        const slots = r?.data?.slots ?? [];
        setRawSlots(slots);
        setValidSlots(filterValidSlots(slots, serviceDuration));
      })
      .finally(() => setLoadingSlots(false));
  };
  useEffect(() => {
    if (!date || !barberId) return;
    getSlots();
  }, [date, barberId]);
  useEffect(() => {
    if (rawSlots.length > 0) {
      setValidSlots(filterValidSlots(rawSlots, serviceDuration));
    }
  }, [serviceDuration]);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p
          className="mb-1 text-xs tracking-[0.15em] uppercase"
          style={{
            color: "var(--color-marca)",
            fontFamily: "var(--font-body)",
          }}
        >
          Paso 3 de 4
        </p>
        <h3
          className="text-xl font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
          }}
        >
          ¿Cuándo venís?
        </h3>
      </div>

      {}
      <div>
        <label
          className="mb-2 block text-xs font-semibold tracking-wide uppercase"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          Fecha
        </label>
        <input
          type="date"
          min={todayISO()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200 outline-none"
          style={{
            background: "rgba(0,0,0,0.25)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-body)",
            colorScheme: "dark",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-border-strong)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--color-border)";
          }}
        />
      </div>

      {}
      {date && (
        <div>
          <label
            className="mb-2 block text-xs font-semibold tracking-wide uppercase"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Horario disponible
          </label>

          {loadingSlots ? (
            <div className="flex justify-center py-6">
              <Spinner size={20} />
            </div>
          ) : validSlots.length === 0 ? (
            <div
              className="rounded-xl px-4 py-5 text-center text-sm"
              style={{
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              No hay turnos disponibles para ese día. Probá con otra fecha.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {validSlots.map((s) => (
                  <button
                    key={s.startTime}
                    onClick={() => {
                      setSlot(s.startTime);
                      onNext();
                    }}
                    className="rounded-xl py-2.5 text-sm font-semibold transition-all duration-150"
                    style={{
                      background:
                        startTime === s.startTime
                          ? "rgba(248,223,176,0.15)"
                          : "rgba(0,0,0,0.2)",
                      border: `1px solid ${startTime === s.startTime ? "var(--color-border-strong)" : "var(--color-border)"}`,
                      color:
                        startTime === s.startTime
                          ? "var(--color-marca)"
                          : "var(--color-text-secondary)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {s.startTime}
                  </button>
                ))}
              </div>
              <p
                className="mt-2 text-center text-xs"
                style={{
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-body)",
                }}
              >
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
function StepClient({ onNext }: { onNext: () => void }) {
  const { clientName, clientPhone, notes, setClient } = useBookingStore();
  const [name, setName] = useState(clientName);
  const [phone, setPhone] = useState(clientPhone);
  const [note, setNote] = useState(notes);
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setClient(name.trim(), phone.trim(), note.trim());
    onNext();
  }
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p
          className="mb-1 text-xs tracking-[0.15em] uppercase"
          style={{
            color: "var(--color-marca)",
            fontFamily: "var(--font-body)",
          }}
        >
          Paso 4 de 4
        </p>
        <h3
          className="text-xl font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
          }}
        >
          Tus datos
        </h3>
        <p
          className="mt-1 text-xs"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          Solo para avisarte si hay algún cambio. Nada más.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field
          label="Nombre completo *"
          type="text"
          placeholder="Juan Pérez"
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
          <label
            className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Algo que quieras aclarar
          </label>
          <textarea
            placeholder="Opcional — decile algo al barbero"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-xl px-4 py-3 text-sm transition-all duration-200 outline-none"
            style={{
              background: "rgba(0,0,0,0.25)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-body)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-border-strong)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border)";
            }}
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
        <div
          className="flex size-16 items-center justify-center rounded-full text-2xl"
          style={{
            background: "rgba(134,197,134,0.12)",
            border: "1px solid rgba(134,197,134,0.3)",
            color: "var(--color-success)",
          }}
        >
          ✓
        </div>
        <div>
          <h3
            className="mb-1 text-xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            ¡Listo, estás anotado!
          </h3>
          <p
            className="text-sm"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Te esperamos el{" "}
            <strong
              style={{
                color: "var(--color-text-primary)",
              }}
            >
              {store.date}
            </strong>{" "}
            a las{" "}
            <strong
              style={{
                color: "var(--color-text-primary)",
              }}
            >
              {store.startTime}
            </strong>{" "}
            con{" "}
            <strong
              style={{
                color: "var(--color-marca)",
              }}
            >
              {store.barberName}
            </strong>
            .
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
    {
      label: "Barbero",
      value: store.barberName,
    },
    {
      label: "Servicio",
      value: store.serviceName,
    },
    {
      label: "Precio",
      value: formatARS(store.servicePrice),
    },
    {
      label: "Fecha",
      value: store.date,
    },
    {
      label: "Hora",
      value: store.startTime,
    },
    {
      label: "Nombre",
      value: store.clientName,
    },
    {
      label: "Teléfono",
      value: store.clientPhone,
    },
    ...(store.notes
      ? [
          {
            label: "Notas",
            value: store.notes,
          },
        ]
      : []),
  ];
  return (
    <div className="flex flex-col gap-4">
      <h3
        className="text-xl font-bold"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
        }}
      >
        Confirmá tu turno
      </h3>
      <div
        className="overflow-hidden rounded-xl"
        style={{
          border: "1px solid var(--color-border)",
        }}
      >
        {rows.map((r, i) => (
          <div
            key={r.label}
            className="flex items-center justify-between px-4 py-2.5"
            style={{
              borderBottom:
                i < rows.length - 1 ? "1px solid var(--color-border)" : "none",
              background: i % 2 === 0 ? "rgba(0,0,0,0.15)" : "transparent",
            }}
          >
            <span
              className="text-xs font-semibold"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              {r.label}
            </span>
            <span
              className="text-sm font-medium"
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              {r.value}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div
          className="rounded-xl px-3 py-2.5 text-sm"
          style={{
            background: "rgba(220,100,100,0.1)",
            border: "1px solid var(--color-border-error)",
            color: "var(--color-error)",
            fontFamily: "var(--font-body)",
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={loading}
        className="btn-marca flex w-full items-center justify-center gap-2 rounded-xl py-3.5"
        style={{
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? <Spinner size={16} /> : "Confirmar turno ✓"}
      </button>
    </div>
  );
}
export default function BookingModal() {
  const { isOpen, step, setStep, closeModal, reset } = useBookingStore();
  function handleClose() {
    reset();
    closeModal();
  }
  return (
    <ModalBase open={isOpen} onClose={handleClose} maxW="max-w-md">
      {}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center gap-3">
          {step > 1 && step < 5 && (
            <button
              onClick={() => setStep((step - 1) as typeof step)}
              className="flex items-center gap-1 text-xs font-semibold transition-colors duration-150"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              ← Volver
            </button>
          )}
          <StepDots current={step - 1} total={4} />
        </div>
        <button
          onClick={handleClose}
          className="flex size-7 items-center justify-center rounded-lg text-sm transition-colors duration-150"
          style={{
            color: "var(--color-text-muted)",
            background: "rgba(248,223,176,0.06)",
          }}
        >
          ✕
        </button>
      </div>

      {}
      <div
        className="overflow-y-auto px-5 py-5"
        style={{
          maxHeight: "75dvh",
        }}
      >
        {step === 1 && <StepBarber onNext={() => setStep(2)} />}
        {step === 2 && <StepService onNext={() => setStep(3)} />}
        {step === 3 && <StepDateTime onNext={() => setStep(4)} />}
        {step === 4 && <StepClient onNext={() => setStep(5)} />}
        {step === 5 && <StepConfirm onClose={handleClose} />}
      </div>
    </ModalBase>
  );
}
