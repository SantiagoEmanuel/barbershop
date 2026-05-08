import { useEffect, useState } from "react";
import { ModalBase } from "../components/modalBase";
import { UserAvatar } from "../components/ui/avatar";
import { EmptyState } from "../components/ui/emptyState";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api, post, put } from "../lib/api";
interface Schedule {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
}
interface Barber {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  avatarUrl?: string | null;
  experienceYears?: number | null;
  isActive: boolean;
  schedules?: Schedule[];
}
const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
function FieldInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-xs font-semibold tracking-wide uppercase"
        style={{
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-body)",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 outline-none"
        style={{
          background: "rgba(0,0,0,0.3)",
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
  );
}
function BarberModal({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Barber | null;
  onSave: (b: Barber) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [expYears, setExpYears] = useState(
    String(initial?.experienceYears ?? ""),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setSlug(initial?.slug ?? "");
      setBio(initial?.bio ?? "");
      setExpYears(String(initial?.experienceYears ?? ""));
      setError("");
    }
  }, [open, initial]);
  function handleNameChange(v: string) {
    setName(v);
    if (!initial) {
      setSlug(
        v
          .toLowerCase()
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      );
    }
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = {
        name,
        slug,
        bio: bio || undefined,
        experienceYears: expYears ? Number(expYears) : undefined,
      };
      const res = initial
        ? await put<{
            data: Barber;
          }>(`barber/${initial.id}`, body)
        : await post<{
            data: Barber;
          }>("barber", body);
      if (!res) throw new Error("No se pudo guardar");
      onSave(
        (
          res as {
            data: Barber;
          }
        ).data,
      );
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }
  return (
    <ModalBase open={open} onClose={onClose} maxW="max-w-sm">
      <div className="px-6 py-5">
        <h3
          className="mb-4 text-lg font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
          }}
        >
          {initial ? "Editar barbero" : "Nuevo barbero"}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <FieldInput
            label="Nombre completo *"
            value={name}
            onChange={handleNameChange}
          />
          <FieldInput
            label="Slug (URL)"
            value={slug}
            onChange={setSlug}
            placeholder="juan-perez"
          />
          <p
            className="-mt-1 text-xs"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Solo minúsculas, números y guiones. Se usa en la URL del perfil.
          </p>
          <FieldInput
            label="Bio"
            value={bio}
            onChange={setBio}
            placeholder="Especialista en..."
          />
          <FieldInput
            label="Años de experiencia"
            value={expYears}
            onChange={setExpYears}
            type="number"
          />

          {error && (
            <p
              className="rounded-lg px-3 py-2 text-xs"
              style={{
                background: "rgba(220,100,100,0.1)",
                color: "var(--color-error)",
                fontFamily: "var(--font-body)",
              }}
            >
              {error}
            </p>
          )}
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 rounded-xl py-2.5 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-marca flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5"
              style={{
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <Spinner size={14} /> : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </ModalBase>
  );
}
function SchedulePanel({
  barber,
  onClose,
}: {
  barber: Barber;
  onClose: () => void;
}) {
  const [schedules, setSchedules] = useState<Schedule[]>(
    DAYS.map((_, i) => {
      const existing = barber.schedules?.find((s) => s.dayOfWeek === i);
      return (
        existing ?? {
          dayOfWeek: i,
          startTime: "09:00",
          endTime: i === 6 ? "14:00" : "19:00",
          slotDurationMinutes: 10,
          isActive: i >= 1 && i <= 6,
        }
      );
    }),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all(
        schedules
          .filter((s) => s.isActive)
          .map((s) =>
            s.id
              ? put(`barber-schedule/${s.id}`, s)
              : post(`barber-schedule`, {
                  ...s,
                  barberId: barber.id,
                }),
          ),
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }
  return (
    <ModalBase open onClose={onClose} maxW="max-w-md">
      <div className="px-6 py-5">
        <div className="mb-5 flex items-center gap-3">
          <UserAvatar name={barber.name} size="md" />
          <div>
            <h3
              className="text-base font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Horarios de {barber.name.split(" ")[0]}
            </h3>
            <p
              className="text-xs"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              Configurá los días y horas de trabajo
            </p>
          </div>
        </div>

        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
          {schedules.map((s, i) => (
            <div
              key={s.dayOfWeek}
              className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-150"
              style={{
                background: s.isActive
                  ? "rgba(248,223,176,0.05)"
                  : "rgba(0,0,0,0.15)",
                border: `1px solid ${s.isActive ? "var(--color-border-strong)" : "var(--color-border)"}`,
                opacity: s.isActive ? 1 : 0.5,
              }}
            >
              {}
              <button
                onClick={() =>
                  setSchedules((prev) =>
                    prev.map((x) =>
                      x.dayOfWeek === i
                        ? {
                            ...x,
                            isActive: !x.isActive,
                          }
                        : x,
                    ),
                  )
                }
                className="size-8 shrink-0 rounded-lg text-xs font-bold transition-all duration-150"
                style={{
                  background: s.isActive
                    ? "rgba(248,223,176,0.15)"
                    : "rgba(0,0,0,0.3)",
                  color: s.isActive
                    ? "var(--color-marca)"
                    : "var(--color-text-muted)",
                  border: `1px solid ${s.isActive ? "var(--color-border-strong)" : "var(--color-border)"}`,
                  fontFamily: "var(--font-body)",
                }}
              >
                {DAYS[i]}
              </button>

              {}
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="time"
                  value={s.startTime}
                  disabled={!s.isActive}
                  onChange={(e) =>
                    setSchedules((prev) =>
                      prev.map((x) =>
                        x.dayOfWeek === i
                          ? {
                              ...x,
                              startTime: e.target.value,
                            }
                          : x,
                      ),
                    )
                  }
                  className="flex-1 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-body)",
                    colorScheme: "dark",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                >
                  a
                </span>
                <input
                  type="time"
                  value={s.endTime}
                  disabled={!s.isActive}
                  onChange={(e) =>
                    setSchedules((prev) =>
                      prev.map((x) =>
                        x.dayOfWeek === i
                          ? {
                              ...x,
                              endTime: e.target.value,
                            }
                          : x,
                      ),
                    )
                  }
                  className="flex-1 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-body)",
                    colorScheme: "dark",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <p
          className="mt-3 mb-4 text-xs"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          Los slots se generan cada 10 minutos. El frontend los agrupa según la
          duración del servicio.
        </p>

        {saved && (
          <div
            className="mb-3 rounded-lg px-3 py-2 text-xs"
            style={{
              background: "rgba(134,197,134,0.1)",
              color: "var(--color-success)",
              border: "1px solid rgba(134,197,134,0.2)",
              fontFamily: "var(--font-body)",
            }}
          >
            ✓ Horarios guardados correctamente
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="btn-ghost flex-1 rounded-xl py-2.5 text-sm"
          >
            Cerrar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-marca flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5"
            style={{
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? <Spinner size={14} /> : "Guardar horarios"}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
export default function Barberos() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [barberModal, setBarberModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [schedulesFor, setSchedulesFor] = useState<Barber | null>(null);
  useEffect(() => {
    api<{
      data: Barber[];
    }>("barber?all=true")
      .then((r) => setBarbers(r?.data ?? []))
      .finally(() => setLoading(false));
  }, []);
  async function softDelete(id: string) {
    if (!confirm("¿Desactivar este barbero? No se borrará su historial."))
      return;
    const res = await put<{
      data: Barber;
    }>(`barber/${id}`, {
      isActive: false,
    });
    if (res)
      setBarbers((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                isActive: false,
              }
            : b,
        ),
      );
  }
  async function reactivate(id: string) {
    const res = await put<{
      data: Barber;
    }>(`barber/${id}`, {
      isActive: true,
    });
    if (res)
      setBarbers((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                isActive: true,
              }
            : b,
        ),
      );
  }
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow="Admin"
        title="Barberos"
        description="Gestioná el equipo y sus horarios de trabajo."
        action={
          <button
            onClick={() => {
              setEditingBarber(null);
              setBarberModal(true);
            }}
            className="btn-marca rounded-xl px-4 py-2 text-sm"
          >
            + Nuevo barbero
          </button>
        }
      />

      {barbers.length === 0 ? (
        <EmptyState
          icon="✂️"
          title="Sin barberos"
          description="Agregá el primer barbero para empezar a tomar turnos."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {barbers.map((b) => (
            <div
              key={b.id}
              className="card flex items-center gap-4"
              style={{
                opacity: b.isActive ? 1 : 0.55,
              }}
            >
              <UserAvatar name={b.name} size="lg" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className="text-sm font-bold"
                    style={{
                      color: "var(--color-text-primary)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {b.name}
                  </p>
                  {!b.isActive && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px]"
                      style={{
                        background: "rgba(224,128,128,0.1)",
                        color: "var(--color-error)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      Inactivo
                    </span>
                  )}
                </div>
                <p
                  className="mt-0.5 text-xs"
                  style={{
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  @{b.slug}
                  {b.experienceYears ? ` · ${b.experienceYears} años` : ""}
                </p>
                {b.bio && (
                  <p
                    className="mt-0.5 truncate text-xs"
                    style={{
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {b.bio}
                  </p>
                )}
              </div>

              {}
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => setSchedulesFor(b)}
                  className="h-8 rounded-lg px-3 text-xs font-semibold transition-colors duration-150"
                  style={{
                    background: "rgba(248,223,176,0.06)",
                    color: "var(--color-marca)",
                    border: "1px solid var(--color-border)",
                    fontFamily: "var(--font-body)",
                  }}
                  title="Ver horarios"
                >
                  Horarios
                </button>
                <button
                  onClick={() => {
                    setEditingBarber(b);
                    setBarberModal(true);
                  }}
                  className="flex size-8 items-center justify-center rounded-lg text-sm transition-colors duration-150"
                  style={{
                    background: "rgba(248,223,176,0.06)",
                    color: "var(--color-text-muted)",
                    border: "1px solid var(--color-border)",
                  }}
                  title="Editar"
                >
                  ✏
                </button>
                {b.isActive ? (
                  <button
                    onClick={() => softDelete(b.id)}
                    className="flex size-8 items-center justify-center rounded-lg text-xs transition-colors duration-150"
                    style={{
                      background: "rgba(224,128,128,0.06)",
                      color: "var(--color-error)",
                      border: "1px solid rgba(224,128,128,0.15)",
                    }}
                    title="Desactivar"
                  >
                    ✕
                  </button>
                ) : (
                  <button
                    onClick={() => reactivate(b.id)}
                    className="flex size-8 items-center justify-center rounded-lg text-xs transition-colors duration-150"
                    style={{
                      background: "rgba(134,197,134,0.06)",
                      color: "var(--color-success)",
                      border: "1px solid rgba(134,197,134,0.15)",
                    }}
                    title="Reactivar"
                  >
                    ↺
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <BarberModal
        open={barberModal}
        onClose={() => setBarberModal(false)}
        initial={editingBarber}
        onSave={(b) =>
          setBarbers((prev) =>
            editingBarber
              ? prev.map((x) => (x.id === b.id ? b : x))
              : [...prev, b],
          )
        }
      />

      {schedulesFor && (
        <SchedulePanel
          barber={schedulesFor}
          onClose={() => setSchedulesFor(null)}
        />
      )}
    </div>
  );
}
