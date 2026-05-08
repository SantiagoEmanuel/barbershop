import { useEffect, useState } from "react";
import { ModalBase } from "../components/modalBase";
import { UserAvatar } from "../components/ui/avatar";
import { EmptyState } from "../components/ui/emptyState";
import { FieldInput } from "../components/ui/fieldInput";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api, post, put } from "../lib/api";
import type { ApiResponse, Barber, Schedule } from "../types";

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// ── Modal: editar/crear barbero ───────────────────────────────
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
          .replace(/[̀-ͯ]/g, "")
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
        ? await put<ApiResponse<Barber>>(`barber/${initial.id}`, body)
        : await post<ApiResponse<Barber>>("barber", body);
      if (!res?.data) throw new Error("No se pudo guardar");
      onSave(res.data);
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
        <h3 className="font-display text-text-primary mb-4 text-lg font-bold">
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
          <p className="text-text-muted font-body -mt-1 text-xs">
            Solo minúsculas, números y guiones. Se usa en la URL del perfil.
          </p>
          <FieldInput
            label="Bio"
            value={bio ?? ""}
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
            <p className="bg-error/10 text-error font-body rounded-lg px-3 py-2 text-xs">
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
              className="btn-marca flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 disabled:opacity-70"
            >
              {loading ? <Spinner size={14} /> : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </ModalBase>
  );
}

// ── Panel: horarios del barbero ───────────────────────────────
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
              : post(`barber-schedule`, { ...s, barberId: barber.id }),
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
            <h3 className="font-display text-text-primary text-base font-bold">
              Horarios de {barber.name.split(" ")[0]}
            </h3>
            <p className="text-text-muted font-body text-xs">
              Configurá los días y horas de trabajo
            </p>
          </div>
        </div>

        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
          {schedules.map((s, i) => (
            <div
              key={s.dayOfWeek}
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition-all duration-150 ${
                s.isActive
                  ? "bg-marca/5 border-border-strong"
                  : "border-border bg-black/15 opacity-50"
              }`}
            >
              <button
                onClick={() =>
                  setSchedules((prev) =>
                    prev.map((x) =>
                      x.dayOfWeek === i ? { ...x, isActive: !x.isActive } : x,
                    ),
                  )
                }
                className={`font-body size-8 shrink-0 rounded-lg border text-xs font-bold transition-all duration-150 ${
                  s.isActive
                    ? "bg-marca/15 text-marca border-border-strong"
                    : "text-text-muted border-border bg-black/30"
                }`}
              >
                {DAYS[i]}
              </button>

              <div className="flex flex-1 items-center gap-2">
                <input
                  type="time"
                  value={s.startTime}
                  disabled={!s.isActive}
                  onChange={(e) =>
                    setSchedules((prev) =>
                      prev.map((x) =>
                        x.dayOfWeek === i
                          ? { ...x, startTime: e.target.value }
                          : x,
                      ),
                    )
                  }
                  className="border-border text-text-primary font-body flex-1 rounded-lg border bg-black/25 px-2.5 py-1.5 text-xs [color-scheme:dark] outline-none"
                />
                <span className="text-text-muted text-xs">a</span>
                <input
                  type="time"
                  value={s.endTime}
                  disabled={!s.isActive}
                  onChange={(e) =>
                    setSchedules((prev) =>
                      prev.map((x) =>
                        x.dayOfWeek === i
                          ? { ...x, endTime: e.target.value }
                          : x,
                      ),
                    )
                  }
                  className="border-border text-text-primary font-body flex-1 rounded-lg border bg-black/25 px-2.5 py-1.5 text-xs [color-scheme:dark] outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-text-muted font-body mt-3 mb-4 text-xs">
          Los slots se generan cada 10 minutos. El frontend los agrupa según la
          duración del servicio.
        </p>

        {saved && (
          <div className="bg-success/10 text-success border-success/20 font-body mb-3 rounded-lg border px-3 py-2 text-xs">
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
            className="btn-marca flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 disabled:opacity-70"
          >
            {saving ? <Spinner size={14} /> : "Guardar horarios"}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

// ── Página ────────────────────────────────────────────────────
export default function Barberos() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [barberModal, setBarberModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [schedulesFor, setSchedulesFor] = useState<Barber | null>(null);

  useEffect(() => {
    api<ApiResponse<Barber[]>>("barber?all=true")
      .then((r) => setBarbers(r?.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function softDelete(id: string) {
    if (!confirm("¿Desactivar este barbero? No se borrará su historial."))
      return;
    const res = await put<ApiResponse<Barber>>(`barber/${id}`, {
      isActive: false,
    });
    if (res)
      setBarbers((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isActive: false } : b)),
      );
  }

  async function reactivate(id: string) {
    const res = await put<ApiResponse<Barber>>(`barber/${id}`, {
      isActive: true,
    });
    if (res)
      setBarbers((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isActive: true } : b)),
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
              className={`card flex items-center gap-4 ${b.isActive ? "" : "opacity-55"}`}
            >
              <UserAvatar name={b.name} size="lg" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-text-primary font-body text-sm font-bold">
                    {b.name}
                  </p>
                  {!b.isActive && (
                    <span className="bg-error/10 text-error font-body rounded-full px-2 py-0.5 text-[10px]">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="text-text-muted font-body mt-0.5 text-xs">
                  @{b.slug}
                  {b.experienceYears ? ` · ${b.experienceYears} años` : ""}
                </p>
                {b.bio && (
                  <p className="text-text-muted font-body mt-0.5 truncate text-xs">
                    {b.bio}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => setSchedulesFor(b)}
                  className="bg-marca/6 text-marca border-border font-body h-8 rounded-lg border px-3 text-xs font-semibold transition-colors duration-150"
                  title="Ver horarios"
                >
                  Horarios
                </button>
                <button
                  onClick={() => {
                    setEditingBarber(b);
                    setBarberModal(true);
                  }}
                  className="bg-marca/6 text-text-muted border-border flex size-8 items-center justify-center rounded-lg border text-sm transition-colors duration-150"
                  title="Editar"
                >
                  ✏
                </button>
                {b.isActive ? (
                  <button
                    onClick={() => softDelete(b.id)}
                    className="bg-error/6 text-error border-error/15 flex size-8 items-center justify-center rounded-lg border text-xs transition-colors duration-150"
                    title="Desactivar"
                  >
                    ✕
                  </button>
                ) : (
                  <button
                    onClick={() => reactivate(b.id)}
                    className="bg-success/6 text-success border-success/15 flex size-8 items-center justify-center rounded-lg border text-xs transition-colors duration-150"
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
